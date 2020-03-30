<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar class="items-start">
        <q-toolbar-title class="no-ellipsis q-py-sm">
          Aktuelle SARS-CoV-2 Fallzahlen der Kantone und Fürstentum Liechtenstein (FL)
        </q-toolbar-title>
        <img src="../assets/ktzh-logo-mobile.svg" alt="Logo Kanton Zürich" class="q-mt-sm" />
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<style>
.no-ellipsis {
  white-space: normal;
}
.items-start {
  align-items: flex-start !important;
}
</style>

<script>
export default {
  name: 'MainLayout',
  data () {
    return {
    }
  }
}
</script>
