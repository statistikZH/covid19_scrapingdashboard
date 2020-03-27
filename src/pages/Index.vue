<template>
  <q-page class="q-pa-sm">

    <!-- Subtitle -->
    <h2>Aufbereitet vom Statistischen Amt Kanton Zürich</h2>

    <!-- legend -->
    <ul class="q-mb-lg">
      <li v-for="state in states" :key="state.id" class="q-mb-sm">
        <q-btn round flat size="sm" class="q-mr-sm" :style="'background:' + state.color" />{{ state.desc }}
      </li>
    </ul>

    <!-- table -->
    <q-table
      :data="data"
      :columns="columns"
      :pagination.sync="pagination"
      row-key="name"
    >
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td key="abk" :props="props">
            {{ props.row.abk }}
          </q-td>
          <q-td key="date" :props="props" :style="`background:${props.row.color.color}`">
            {{ $statUtils.sortToLabelDate(props.row.date) }}
          </q-td>
          <q-td key="csv" :props="props">
            <a :href="props.row.csv" target="_blank">
              <q-chip square>
                <q-avatar icon="call_made" color="grey-6" text-color="white" />
                CSV
              </q-chip>
            </a>
          </q-td>
          <q-td key="source" :props="props">
            <a :href="props.row.source" target="_blank">
              <q-chip square>
                <q-avatar icon="call_made" color="grey-6" text-color="white" />
                {{ props.row.source }}
              </q-chip>
            </a>
          </q-td>
        </q-tr>
      </template>
    </q-table>
  </q-page>
</template>

<script>
export default {
  name: 'PageIndex',
  data () {
    return {
      // custom defs ---------------------------------------------------------------------------
      urlRepo: 'https://raw.githubusercontent.com/openZH/covid_19/master/',
      urlOverwiew: 'mappingCanton_BFS.csv',
      urlTotal: 'COVID19_Fallzahlen_CH_total.csv',
      states: [
        { id: 1, color: '#7fc97f', desc: 'Daten für heute vorhanden' },
        { id: 2, color: '#beaed4', desc: 'Daten für heute noch ausstehend' },
        { id: 3, color: '#fdc086', desc: 'Daten älter als 24h' }
      ],
      // table defs ---------------------------------------------------------------------------
      columns: [
        {
          name: 'abk',
          align: 'center',
          label: 'Kanton / FL',
          field: 'abk',
          sortable: true
        },
        {
          name: 'date',
          align: 'left',
          label: 'Datum, Zeit',
          field: 'date',
          sortable: true
        },
        {
          name: 'source',
          align: 'left',
          label: 'Offizielle Quelle',
          field: 'source',
          sortable: true
        },
        {
          name: 'csv',
          align: 'left',
          label: 'Fallzahlen',
          field: 'csv'
        },
        {
          name: 'source',
          align: 'left',
          label: 'Fallzahlen',
          field: 'source',
          sortable: true
        }
      ],
      pagination: {
        sortBy: 'abk',
        descending: false,
        rowsPerPage: 27 + 1
      },
      // data defs ---------------------------------------------------------------------------
      data: []
    }
  },
  mounted () {
    /*
    load overview data to know all the area available

    abk: "ZH"
    bfs: "01"
    */
    this.$statUtils.loadCSV(
      this.urlRepo + this.urlOverwiew,
      (array) => {
        const data = array

        /*
        // start of second load --------------------------------------------------------
        load updates => sort first by date and get only the newest one

        abbreviation_canton_and_fl: "GE"
        date: "2020-02-25"
        ncumul_ICU: "0"
        ncumul_conf: ""
        ncumul_deceased: ""
        ncumul_hosp: "0"
        ncumul_released: ""
        ncumul_tested: ""
        ncumul_vent: "0"
        source: "https://www.ge.ch/document/covid-19-situation-epidemiologique-geneve/telecharger"
        time: ""
        */
        this.$statUtils.loadCSV(
          this.urlRepo + this.urlTotal,
          (array) => {
            // sort by date
            array.sort((objA, objB) => {
              return this.$statUtils.sortDateToSeconds(objB.date) - this.$statUtils.sortDateToSeconds(objA.date)
            })

            const today = this.$statUtils.sortDateToSeconds(this.$statUtils.today())
            const todayMinus24h = today - (24 * 60 * 60)

            // take only first one
            for (const obj of array) {
              const item = data.find(o => o.abk === obj.abbreviation_canton_and_fl)
              if (!item.date) {
                const date = obj.time !== '' && obj.time !== '""' ? obj.date + ' ' + obj.time : obj.date
                item.date = date
                item.source = obj.source

                // add color
                const dateTime = this.$statUtils.sortDateToSeconds(date)
                if (dateTime >= today) {
                  item.color = this.states[0]
                } else if (dateTime > todayMinus24h) {
                  item.color = this.states[1]
                } else {
                  item.color = this.states[2]
                }

                // add csv
                item.csv = this.urlRepo + 'fallzahlen_kanton_total_csv/COVID19_Fallzahlen_' + (item.abk === 'FL' ? '' : 'Kanton_') + item.abk + '_total.csv'
              }
            }

            this.data = data
          }
        )
        // end of second load --------------------------------------------------------
      }
    )
  }
}
</script>
