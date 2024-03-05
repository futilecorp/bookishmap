<script>
export default {
  props: ['data'],

  computed: {
    openingHours() {
      let hours = this.data.properties['opening_hours'];
      if (typeof hours == "string") {
        return hours.split(';');
      } else {
        return "";
      }
    }

  }
}
</script>



<template>
  <details class="result_item">
    <summary>
      {{ this.data.properties['name'] }}
    </summary>
    <p>{{ this.data.properties['addr:street'] }} {{ this.data.properties['addr:housenumber'] }}, {{ this.data.properties['addr:postcode'] }} {{ this.data.properties['addr:city'] }}</p>
    <p>{{ this.openingHours }}</p>
  </details>
</template>



<style>
.result_item {
  border: 1px solid black;
  padding: 8px;
  cursor: pointer;
}

.result_item:hover, .result_item:active {
  background-color: #E1C683;
}

.result_details {

}
</style>
