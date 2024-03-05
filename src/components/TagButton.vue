<script>
  export default {
    props: ["label", "filter"],
    computed: {
      actualTag() {
        // if no filter tag supplied, default to the name of the label
        return this.filter || this.label;
      }
    }
  }
</script>

<template>
  <button class="tag" type="button" :data-filter="actualTag">{{ this.label }}</button>
</template>

<style>
  button.tag {
    text-transform: uppercase;
  }
</style>
