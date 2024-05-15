<script>
import { toRaw } from "vue";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { LCircleMarker, LMap, LMarker, LTileLayer, LTooltip } from "@vue-leaflet/vue-leaflet";

import ListEntry from './components/ListEntry.vue';
import TagButton from './components/TagButton.vue';

export default {
  beforeMount() {
    this.getPoints();
  },
  components: {
    ListEntry,
    LMap,
    LCircleMarker,
    LMarker,
    LTileLayer,
    LTooltip,
    TagButton
  },
  data() {
    return {
      allPoints: [], // before filtering
      filter: [], // an array of [key, value, (morevalues...)] arrays
      /* points: [], // after filtering */
      highlighted: null, // id of currently selected shop
      maptilerId: "basic-v2-light/256",
      maptilerApi: "h24s9QHr7NmztAXKJCDP",
      zoom: 12,
      circleMarkerStyle:{
        radius: 8,
        fillColor: "#DA9239",
        color: "#162C74",
        weight: 1,
        opacity: 1,
        fillOpacity: 1
      },
      hoverTooltipOptions: {
        // available options: 
        // https://leafletjs.com/reference.html#tooltip-option
        direction: 'top',
        className: 'maptooltip', // style by adding a CSS definition
      },
      showControls: true
    };
  },
  computed: {
    maptilerUrl() {
      return `https://api.maptiler.com/maps/${this.maptilerId}/{z}/{x}/{y}.png?key=${this.maptilerApi}`
    },
    points() {
      let points = this.allPoints;
      for (let [field, ...values] of this.filter) {
        points = points.filter((p) => values.includes(p[field])); 
      }
      return points;
    },
  },
  methods: {
    getPoints() {
      fetch('/new_data.json')
        .then(response => response.json())
        .then(data => {
            this.allPoints = Object.values(data).map((el) => {
              // copy all raw OSM properties to root level (unless they've been 
              // overridden)
              for (let key of Object.keys(el.raw)) {
                if (!(key in el)) {
                  el[key] = el.raw[key];
                }
              }
              return el;
            });
        })
    },
    selectHighlight(id = null) {
      // this method is called when an entry is clicked on the map
      // setting this entry as highlighted adds a class which makes sure the 
      // summary is expanded to display all details
      this.highlighted = id;
      if (this.highlighted != null) {
        this.$refs.items.find((e) => e.data.id == this.highlighted).$el.scrollIntoView();
      }
    },
    isActiveFilter(field) {
      return this.filter.findIndex((f) => f[0] == field) != -1;
    },
    clearFilter() {
      this.filter.length = 0;
    },
    setFilter(field, values) {
      const pos = this.filter.findIndex((f) => f[0] == field);
      if (pos != -1) {
        if (values == null) {
          // remove
          this.filter.splice(pos, 1);
        } else {
          // replace
          this.filter[pos] = [field, ...values];
        }
      } else if (values != null) {
        // add new
        this.filter.push([field, ...values]);
      }
    },
    toggleFilter(e) {
      const [field, ...values] = e.target.__vnode.props['data-filter'];
      const isAlreadyActive = this.filter.findIndex((f) => f[0] == field && f[1] == values[0]);
      if (isAlreadyActive == -1) {
        // add
        this.setFilter(field, values);
      } else {
        // remove
        this.filter.splice(isAlreadyActive, 1);
      }
    },
    toggleSelect(e) {
      //TODO: when street library is selected, the other filters should be grayed out and 
      //not clickable. For libraries, the filter special topic should be removed
      this.setFilter(e.target.name, e.target.value == '' ? null : [e.target.value]);
    },
    zoomToPoint(p) {
      this.$refs.map.leafletObject.flyTo(p.coords, 15);
      // TODO also highlight on map somehow? yessss. also the zooming
      // is a bit weird, but maybe the highlight of just the selected bookstore
      // would solve 
    },
    toggleFilterMobile() {
      //this is for showing the filtering on mobile
      this.showControls = ! this.showControls;
    },
    showResults() {
      //this is for showing the filtering on mobile
      this.showControls = ! this.showControls;
    }
  }
};
</script>

<template>
    <div id="container">
      <div id="top">
        <div id="title">
          <p>OpenBook</p>
          <div id="menuButtons">
            <button id="readmore" type="button">Read more</button>
            <button id="bingo" type="button">Bingo</button>
            <button id="github" type="button">Github</button>
          </div>
        </div>
        <div id="filter">
          <div id="filtering">
            <div id="filterTitle">Filter by:</div>
            <TagButton @click="clearFilter" label="clear all" />
          </div>
          <div id="filteringMobile"> 
            <div id="filterTitleMobile" @click="toggleFilterMobile" label="filter">Filter by:</div>
            <TagButton @click="clearFilter" label="clear all" />
          </div>
          <div id="controls" v-if="showControls">
          <!-- changing the selection applies a filter that field 'name' needs to have value 'value' -->
          <select name="type" @change="toggleSelect($event)" id="type-select" :class="{active: this.isActiveFilter('type')}">
            <option value="">TYPE</option>
            <option value="bookshop">BOOKSTORE</option>
            <option value="library">LIBRARY</option>
            <option value="street_lib">STREET LIBRARY</option>
          </select>

          <!-- second_hand tag according to https://wiki.openstreetmap.org/wiki/Key:second_hand -->
          <TagButton @click="toggleFilter" :filter="['second_hand', 'yes', 'only']" label="second hand" :isActive="this.isActiveFilter('second_hand')" />
          <!-- openstreetmap has no events tag, needs to be added to the entries manually -->
          <TagButton @click="toggleFilter" :filter="['events', true]" label="events" :isActive="this.isActiveFilter('events')" />
          <!-- same -->
          <TagButton @click="toggleFilter" :filter="['snacks', true]" label="coffee/snack" :isActive="this.isActiveFilter('snacks')"/>

          <select name="languages" @change="toggleSelect" id="lan-select" :class="{active: this.isActiveFilter('languages')}">
            <option value="">LANGUAGE</option>
            <option value="english">ENGLISH</option>
            <option value="german">GERMAN</option>
            <option value="polish">POLISH</option>
            <option value="french">FRENCH</option>
          </select>

          <!-- 3 more fields which are not tagged by openstreetmap, so will need to be added manually -->
          <TagButton @click="toggleFilter" :filter="['lessons', true]" label="lessons" :isActive="this.isActiveFilter('lessons')" />
          <TagButton @click="toggleFilter" :filter="['open_late', true]" label="open after 6pm" :isActive="this.isActiveFilter('open_late')" />
          <TagButton @click="toggleFilter" :filter="['wheelchair', 'yes', 'limited']" label="wheelchair" :isActive="this.isActiveFilter('wheelchair')" />

          <select name="topic" @change="toggleSelect" id="topic-select" :class="{active: this.isActiveFilter('topic')}">
            <option value="">SPECIAL TOPIC</option>
            <option value="children">CHILDREN BOOKS</option>
            <option value="biographies">BIOGRAPHIES</option>
            <option value="quarterly">QUARTERLY TOPICS</option>
            <option value="scifi">SCIENCE FICTION</option>
          </select>
          <TagButton @click="toggleFilter" label=""/>
          <TagButton @click="toggleFilter" label=""/>
          <TagButton @click="toggleFilter" label=""/>
          <TagButton id="goToResults" @click="showResults" label="Go to results" v-if="showControls"/>
        </div>
        </div>
      </div>

      <div id="bottom">
        <div id="results">
          <ListEntry v-for="p in points" :data="p" ref="items"
              @click="zoomToPoint(p)"
              :open="p.id == this.highlighted"
              :class="{ highlighted: p.id == this.highlighted }"></ListEntry>
        </div>

        <l-map ref="map" v-model:zoom="zoom" :minZoom="10" :center="[52.5105, 13.4061]"
            @movestart="selectHighlight()">
          <l-tile-layer :url="maptilerUrl"></l-tile-layer>
          <l-circle-marker v-for="p in points"
              :lat-lng="p.coords"
              @click="selectHighlight(p.id)"
              :options="circleMarkerStyle">
            <!-- hover tooltip -->
            <l-tooltip :options="hoverTooltipOptions">{{ p.name }}</l-tooltip>
          </l-circle-marker>
        </l-map>
      </div>

    </div>
    <div id="popupDescription">
      <span id="logotext">OpenBook</span> Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.
      <br/><br/>
      <button id="closeReadMore" type="button">Close</button>
    </div>
    <div id="popupBingo">
      Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.
      <br/><br/>
      <!--img src="/bingo.png"-->
      <button id="closeBingo" type="button">Close</button>
    </div>
  </template>

<style>
  /*
colors:
green: #ACBE8B
blue: #0A278B
red: #8F1409
pink: #D79DB0
orange: #CA4023
blueish: #456BB2
yellow: #E1C683
mushy: #B3A47D
bluegray: #9EAFB9
redpink: #C77170
*/

@font-face {
  font-family: "Compagnon-Bold";
  src:
    url("assets/type/Compagnon-Bold.otf") format("opentype"),
    url("assets/type/Compagnon-Bold.woff") format("woff"),
    url("assets/type/Compagnon-Bold.woff2") format("woff2");
}

@font-face {
  font-family: "Compagnon-Medium";
  src:
    url("assets/type/Compagnon-Medium.otf") format("opentype"),
    url("assets/type/Compagnon-Medium.woff") format("woff"),
    url("assets/type/Compagnon-Medium.woff2") format("woff2");
}

@font-face {
  font-family: "Compagnon-Italic";
  src:
    url("assets/type/Compagnon-Italic.otf") format("opentype"),
    url("assets/type/Compagnon-Italic.woff") format("woff"),
    url("assets/type/Compagnon-Italic.woff2") format("woff2");
}

@font-face {
  font-family: "Compagnon-Light";
  src:
    url("assets/type/Compagnon-Light.otf") format("opentype"),
    url("assets/type/Compagnon-Light.woff") format("woff"),
    url("assets/type/Compagnon-Light.woff2") format("woff2");
}

@font-face {
  font-family: "Compagnon-Roman";
  src:
    url("assets/type/Compagnon-Roman.otf") format("opentype"),
    url("assets/type/Compagnon-Roman.woff") format("woff"),
    url("assets/type/Compagnon-Roman.woff2") format("woff2");
}

:root {
  --main-text-color: #162C74;
  --bg-color: #DBA562;
  --hl-color: #CA4023;
}

html, body {
	margin: 0;
	height: 100%;
	font-family: "Compagnon-Medium", sans-serif;
  background-color: var(--bg-color);
}

#container {
	margin: 0;
	height: 100%;
	display: flex;
	flex-direction: column;
  padding: 8px;
}

#top {
	display: flex;
  border-bottom: 1px solid var(--main-text-color);
  border-right: 1px solid var(--main-text-color);
}

#title {
  display: flex;
  flex-direction: column;
	background-color: var(--bg-color);
	padding: 12px 0px;
  width: 500px;
  align-items: center;
  justify-content: center;
  border-right: 1px solid var(--main-text-color);
  border-top: 2px solid var(--main-text-color);
  border-left: 2px solid var(--main-text-color);
}

#title p{
	font-family: "Compagnon-Bold", serif;
	font-size: 56px;
	margin: 0;
  color: var(--main-text-color);
  text-align: center;
}

#title logo{
	width: 500px;
	padding: 24px;
	font-family: "Compagnon-Bold", serif;
	font-size: 16px;
}

#filter {
  width: 100%;
  display: flex;
  flex-direction: column;
}

#filtering {
  display: flex;
  border-top: 1px solid var(--main-text-color);
}

#filteringMobile {
  display: none;
}

#filterTitle {
  text-transform: uppercase;
  background-color: var(--bg-color);
  color: var(--main-text-color);
  border: 1px solid var(--main-text-color);
  flex-grow: 10;
  padding: 4px 32px 32px 4px;
}

#controls {
	width: 100%;
  height: fit-content;
	background-color: var(--bg-color);
	display: flex;
	flex-flow: wrap;
	max-width: -webkit-fill-available;
}

#controlsMobile {
  display: none;
}

#goToResults {
  display: none;
}

select, .tag {
  background-color: var(--bg-color);
  color: var(--main-text-color);
  border: 1px solid var(--main-text-color);
  padding: 4px 32px 32px 4px;
  flex-grow: 1;
  text-align: left;
}

.tag {
	font-size: 16px;
	font-family: "Compagnon-Medium", sans-serif;
}

.tag:hover, select:hover {
  background-color: var(--hl-color);
  cursor: pointer;
}

.tag:active {
  background-color: var(--hl-color);
}

.tag:visited {
	background-color: var(--hl-color);
}

select {
	font-size: 16px;
	font-family: "Compagnon-Medium", sans-serif;
}

#bottom {
	display: flex;
	height: 100%;
	overflow: hidden;
  border-right: 2px solid var(--main-text-color);
  border-bottom: 2px solid var(--main-text-color);
}

#results {
	width: 500px;
	height: 100%;
	background-color: var(--bg-color);
	overflow: scroll;
  padding-top: 0;
  border-right: 1px solid var(--main-text-color);
  border-left: 1px solid var(--main-text-color);
}

#map {
	height: 100%;
	width: 100%;
}

#popupDescription, #popupBingo {
	display: none;
	position: absolute;
	z-index: 500;
	background-color: #CA4023;
	margin-top: 200px;
  margin-left: 500px;
 	top: 0;
 	flex-direction: column;
 	padding: 16px;
 	width: 600px;
}

#logotext {
	font-family: "Compagnon-Bold", serif;
}

#menuButtons {
	display: flex;
	padding-top: 8px;
}

#readmore, #bingo, #github {
	background-color: transparent;
	border: none;
	cursor: pointer;
	color: #0A278B;
}

#readmore:hover, #bingo:hover, #github:hover {
	color: #8F1409;
}

@media only screen and (max-width: 600px) {

  #top {
    flex-direction: column;
  }

  #title {
    width: 100%;
    box-sizing: border-box;
  }

  #filtering {
    display: none;
  }

  #filteringMobile {
    display: flex;
    border-top: 1px solid var(--main-text-color);
  }

  #filterTitleMobile {
    text-transform: uppercase;
    background-color: var(--bg-color);
    color: var(--main-text-color);
    border: 1px solid var(--main-text-color);
    flex-grow: 10;
    padding: 4px 32px 32px 4px;
  }

/*  #controls {
    display: none;
  }*/

  #controlsMobile {
    width: 100%;
    height: fit-content;
    background-color: var(--bg-color);
    display: flex;
    flex-flow: wrap;
    max-width: -webkit-fill-available;
  }

  #goToResults {
    display: block;
  }

  #bottom {
    flex-direction: column;
  }

  #results {
    width: 100%;
    height: 20%;
    box-sizing: border-box;
  }

  .result_item {
    width: 100%;
    box-sizing: border-box;
  }
}
</style>
