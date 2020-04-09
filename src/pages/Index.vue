<template>
  <q-page class="q-pa-sm">

    <!-- Subtitle -->
    <h2 class="q-ml-md">Aufbereitet vom Statistischen Amt Kanton Zürich</h2>

    <!-- main repo -->
    <div class="q-ma-md">
      Daten / Metadaten: <ui-link :href="urlRepo" :label="urlRepo" />
    </div>

    <!-- legend -->
    <ul class="q-mb-lg">
      <li v-for="state in states" :key="state.id" class="q-mb-sm">
        <q-btn round flat size="xs" class="q-mr-sm" :style="'background:' + state.color" />{{ state.desc }}
      </li>
    </ul>

    <!-- table -->
    <q-linear-progress v-if="data.length === 0" indeterminate />
    <q-table
      v-else
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
            <ui-link :href="props.row.csv" label="CSV" />
          </q-td>
          <q-td key="source" :props="props">
            <ui-link :href="props.row.source" :label="props.row.source" />
          </q-td>
          <q-td key="empty" :props="props">
          </q-td>
        </q-tr>
      </template>
      <template v-slot:bottom>
      </template>
    </q-table>

    <!-- license -->
    <div class="q-ma-md">
      MIT License: <ui-link :href="license" />
    </div>

  </q-page>
</template>

<style>
.q-table__bottom {
  display: none;
}
</style>

<script>
import UiLink from 'src/components/UiLink.vue'

export default {
  name: 'PageIndex',
  components: {
    UiLink
  },
  data () {
    return {
      // custom defs ---------------------------------------------------------------------------
      urlRepoRaw: 'https://raw.githubusercontent.com/openZH/covid_19/',
      urlRepo: 'https://github.com/openZH/covid_19/',
      license: 'https://github.com/statistikZH/covid19_scrapingdashboard/blob/master/LICENSE',
      urlOverwiew: 'master/mappingCanton_BFS.csv',
      urlTotal: 'master/COVID19_Fallzahlen_CH_total_v2.csv',
      urlFolder: 'tree/master/fallzahlen_kanton_total_csv_v2/',
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
          sortable: true,
          headerClasses: 'bg-grey-4',
          style: 'width:100px;'
        },
        {
          name: 'date',
          align: 'left',
          label: 'Datum, Zeit',
          field: 'date',
          sortable: true,
          headerClasses: 'bg-grey-4',
          style: 'width:130px;'
        },
        {
          name: 'csv',
          align: 'left',
          label: 'Fallzahlen',
          field: 'csv',
          headerClasses: 'bg-grey-4',
          style: 'width:150px;'
        },
        {
          name: 'source',
          align: 'left',
          label: 'Offizielle Quelle',
          field: 'source',
          headerClasses: 'bg-grey-4'
        },
        {
          name: 'empty',
          align: 'left',
          label: '',
          field: 'empty',
          headerClasses: 'bg-grey-4'
        }
      ],
      pagination: {
        sortBy: 'abk',
        descending: false,
        rowsPerPage: 0
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
      this.urlRepoRaw + this.urlOverwiew,
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
          this.urlRepoRaw + this.urlTotal,
          (array) => {
            // sort by date
            array.sort((objA, objB) => {
              return this.$statUtils.sortDateToSeconds(objB.date) - this.$statUtils.sortDateToSeconds(objA.date)
            })

            const today = this.$statUtils.todayInSeconds()
            const now = this.$statUtils.nowInSeconds()
            const nowMinus24h = now - 86400 // 24 * 60 * 60

            // take only first one
            for (const obj of array) {
              const item = data.find(o => o.abk === obj.abbreviation_canton_and_fl)
              if (!item.date) {
                item.date = obj.time !== '' && obj.time !== '""' ? obj.date + ' ' + obj.time : obj.date
                item.source = obj.source

                // add color
                const date = obj.time !== '' && obj.time !== '""' ? obj.date + 'T' + obj.time + ':00Z' : obj.date
                const dateTime = this.$statUtils.sortDateToSeconds(date)
                if (dateTime >= today) {
                  item.color = this.states[0]
                } else if (dateTime >= nowMinus24h) {
                  item.color = this.states[1]
                } else {
                  item.color = this.states[2]
                }

                // add csv
                item.csv = this.urlRepo + this.urlFolder + 'COVID19_Fallzahlen_' + (item.abk === 'FL' ? '' : 'Kanton_') + item.abk + '_total.csv'
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
