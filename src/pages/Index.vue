<template>
  <q-page class="q-pa-sm">

    <!-- Subtitle -->
    <h2 class="q-ml-md">Aufbereitet vom Statistischen Amt Kanton Zürich</h2>

    <!-- main repo -->
    <div class="q-ma-md">
      Daten / Metadaten: <ui-link :href="urlRepo" :label="urlRepo" />
    </div>

    <!-- legend -->
    <div class="row">
      <div>
        <ul class="q-mb-lg">
          <li v-for="state in states" :key="state.id" class="q-mb-sm">
            <q-btn flat size="xs" class="q-mr-sm" :style="'height:24px; pointer-events:none; background:' + state.color" />{{ state.desc }}
          </li>
        </ul>
      </div>
      <div>
        <ul class="q-mb-lg">
          <li v-for="state in states" :key="state.id" class="q-mb-sm">
            <q-btn round flat size="xs" class="q-mr-sm" :style="'pointer-events:none; background:' + state.color" />{{ state.desc2 }}
            <span class="text-caption q-ml-sm" v-if="state.note">({{ state.note }})</span>
          </li>
        </ul>
      </div>
    </div>

    <!-- table -->
    <q-linear-progress v-if="data.length === 0" indeterminate />
    <q-table
      v-else
      :data="data"
      :columns="columnsWithIndikatoren"
      :pagination.sync="pagination"
      row-key="name"
    >
      <template v-slot:header-cell="props">
        <q-th :props="props" style="padding: 5px">
          {{ props.col.label }}
        </q-th>
      </template>
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td key="abk" :props="props">
            {{ props.row.abk }}
          </q-td>
          <q-td key="date" :props="props" :style="`background:${props.row.color.color}`">
            {{ $utils.sortToLabelDate(props.row.date) }}
          </q-td>
          <q-td key="csv" :props="props">
            <ui-link :href="props.row.csv" label="CSV" />
          </q-td>
          <q-td v-for="item in indikatoren" :key="item" :props="props">
            <q-icon
              v-if="props.row[item].color"
              :name="props.row[item].hoverInfo.join('') !== '' ? 'info' : 'brightness_1'"
              size="md"
              :style="'color:' + props.row[item].color.color"
            >
              <q-tooltip content-style="font-size:14px" v-if="props.row[item].hoverInfo.join('') !== ''">
                {{ props.row[item].hoverInfo.join(', ') }}
              </q-tooltip>
            </q-icon>
          </q-td>
          <q-td key="source" :props="props">
            <ui-link v-for="(item, i) in props.row.source" :key="i" :href="item" :label="item.substr(0, 20) + '...'" />
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
      urlHoverInfo: 'https://raw.githubusercontent.com/openZH/covid19_sources_caseNumbers/master/COVID19_Quellen_CH_total_v2.csv',
      urlInfoExplained: 'https://raw.githubusercontent.com/openZH/covid19_sources_caseNumbers/master/COVID19_Quellen_Informationen.csv',
      states: [
        { id: 1, color: this.$const.COLOR1, desc: 'Daten für heute verfügbar', desc2: 'Werte aktuell verfügbar', note: 'letzte Woche mindestens 5 von 7' },
        { id: 2, color: this.$const.COLOR2, desc: 'Daten für heute noch ausstehend', desc2: 'Werte lückenhaft verfügbar', note: 'mindestens ein Eintrag' },
        { id: 3, color: this.$const.COLOR3, desc: 'Daten älter als 24h', desc2: 'Werte nicht verfügbar' }
      ],
      indikatoren: [
        'ncumul_conf',
        'ncumul_deceased',
        'ncumul_tested',
        'current_hosp',
        'current_icu',
        'current_vent',
        'ncumul_released',
        'new_hosp',
        'current_isolated',
        'current_quarantined'
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
          align: 'center',
          label: 'Datum, Zeit',
          field: 'date',
          sortable: true,
          headerClasses: 'bg-grey-4',
          style: 'width:130px;'
        },
        {
          name: 'csv',
          align: 'center',
          label: 'Fallzahlen',
          field: 'csv',
          headerClasses: 'bg-grey-4',
          style: 'width:130px;'
        },
        // indikatore will be dynamically filled in, in function columnsWithIndikatoren
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
      data: [],
      hoverInfo: []
    }
  },
  computed: {
    columnsWithIndikatoren () {
      const indikatoren = this.indikatoren.map(o => {
        return {
          name: o,
          align: 'center',
          label: o,
          field: o,
          headerClasses: 'bg-grey-4'
        }
      })
      const columns = [...this.columns]
      return [...columns.slice(0, 3), ...indikatoren, ...columns.slice(3, 5)]
    }
  },
  mounted () {
    const today = this.$utils.todayInSeconds()
    const now = this.$utils.nowInSeconds()
    const oneDayInSec = 86400 // 24 * 60 * 60
    const nowMinus24h = now - oneDayInSec
    const nowMinusOneWeek = now - oneDayInSec * 7
    /*
    load overview data to know all the area available

    abk: "ZH"
    bfs: "01"
    */
    this.$utils.loadCSV(
      this.urlRepoRaw + this.urlOverwiew,
      (data) => {
        /*
        // start of second load --------------------------------------------------------
        load updates => sort first by date and get only the newest one

        abbreviation_canton_and_fl: "GE"
        date: "2020-02-25"
        ...indikatoren
        source: "https://www.ge.ch/document/covid-19-situation-epidemiologique-geneve/telecharger"
        time: ""
        */
        this.$utils.loadCSV(
          this.urlRepoRaw + this.urlTotal,
          (array) => {
            this.$utils.loadCSV(
              this.urlInfoExplained,
              (explained) => {
                // load source hover info
                this.$utils.loadCSV(
                  this.urlHoverInfo,
                  (hoverInfo) => {
                    // sort by date
                    array.sort((objA, objB) => {
                      return this.$utils.sortDateToSeconds(objB.date) - this.$utils.sortDateToSeconds(objA.date)
                    })

                    for (const obj of array) {
                      const item = data.find(o => o.abk === obj.abbreviation_canton_and_fl)
                      if (!item.date) {
                        item.date = obj.time !== '' && obj.time !== '""' ? obj.date + ' ' + obj.time : obj.date
                        item.source = obj.source.split('; ')

                        // add color
                        const date = obj.time !== '' && obj.time !== '""' ? obj.date + 'T' + obj.time + ':00Z' : obj.date
                        const dateTime = this.$utils.sortDateToSeconds(date)
                        if (dateTime >= today) {
                          item.color = this.states[0]
                        } else if (dateTime >= nowMinus24h) {
                          item.color = this.states[1]
                        } else {
                          item.color = this.states[2]
                        }

                        // add indikatoren state color
                        const subArray = array.filter(o => o.abbreviation_canton_and_fl === obj.abbreviation_canton_and_fl)
                        for (const indikator of this.indikatoren) {
                          item[indikator] = {}
                          const indicatorCount = subArray.filter(o => o[indikator].length > 0)
                          const indicatorCountOneWeek = indicatorCount.filter(o => this.$utils.sortDateToSeconds(o.date) > nowMinusOneWeek).length
                          if (indicatorCountOneWeek > 4) {
                            item[indikator].color = this.states[0]
                          } else if (indicatorCount.length > 0) {
                            item[indikator].color = this.states[1]
                          } else {
                            item[indikator].color = this.states[2]
                          }
                          // add hover info
                          const info = hoverInfo.filter(o => o.abbreviation_canton_and_fl === obj.abbreviation_canton_and_fl && o.active === '1')
                          // hoverInfo.filter(o => o.abbreviation_canton_and_fl === obj.abbreviation_canton_and_fl && o.from !== '' && this.$utils.sortDateToSeconds(this.$utils.labelToSortDate(o.from)) < now)
                          item[indikator].hoverInfo = info.map(o => {
                            let key = o[indikator + '_src']
                            const explain = explained.find(e => e.value === key)
                            if (explain) {
                              key = explain.information
                            }
                            return key
                          })
                        }

                        // add csv
                        item.csv = this.urlRepo + this.urlFolder + 'COVID19_Fallzahlen_' + (item.abk === 'FL' ? '' : 'Kanton_') + item.abk + '_total.csv'
                      }
                    }
                    this.data = data
                  }
                )
              }
            )
          }
        )
        // end of second load --------------------------------------------------------
      }
    )
  }
}
</script>
