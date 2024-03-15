<script>
export default {
  props: ['data'],

  computed: {
    openingHours() {
      let hours = this.data['opening_hours'];
      if (typeof hours == "string") {
        return hours.replaceAll("; ", "\n");
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
      {{ this.data['name'] }}
    </summary>
    <p>{{ this.data['address'].join(', ') }}</p>
    <p>{{ this.openingHours }}</p>
  </details>
</template>



<style>
p, summary {
  text-wrap: wrap;
}

.result_item {
  border: 1px solid black;
  padding: 8px;
  cursor: pointer;
  white-space: pre;
}

.result_item.highlighted, .result_item:hover, .result_item:active {
  background-color: #E1C683;
}

.result_item[open] {
  background-color: #E1C683;
}
</style>
