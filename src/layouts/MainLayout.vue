<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-toolbar-title>
          Aktuelle SARS-CoV-2 Fallzahlen der Kantone und Fürstentum Liechtenstein (FL)
        </q-toolbar-title>
        <img src="../assets/ktzh-logo-mobile.svg" alt="Logo Kanton Zürich" />
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
export default {
  name: 'MainLayout',
  data () {
    return {
    }
  }
}
</script>
