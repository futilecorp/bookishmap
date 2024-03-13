<script>
  export default {
    props: ["label", "filter", "isActive"],
    computed: {
      actualTag() {
        // if no filter tag supplied, default to the name of the label
        return this.filter || this.label;
      }
    }
  }
</script>

<template>
  <button :class="{tag: true, active: this.isActive}" type="button" :data-filter="actualTag">{{ this.label }}</button>
</template>

<style>
  button.tag {
    text-transform: uppercase;
  }

  button.active, select.active {
    background-color: #8F1409;
  }
</style>
