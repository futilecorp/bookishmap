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
        <div id="controls">
          <select name="type" id="type-select">
            <option value="bookstore">BOOKSTORE</option>
            <option value="library">LIBRARY</option>
            <option value="street_lib">STREET LIBRARY</option>
          </select>

          <TagButton @click="onTagClick" label="second hand" filter="second_hand" />
          <TagButton @click="onTagClick" label="events" />
          <TagButton @click="onTagClick" label="coffee/snack" />

          <select name="languages" id="lan-select">
            <option value="">LANGUAGE</option>
            <option value="english">ENGLISH</option>
            <option value="german">GERMAN</option>
            <option value="polish">POLISH</option>
            <option value="french">FRENCH</option>
          </select>

          <TagButton @click="onTagClick" label="accept orders" />
          <TagButton @click="onTagClick" label="lessons" />
          <TagButton @click="onTagClick" label="open after 6pm" />
          <TagButton @click="onTagClick" label="wheelchair" />

          <select name="languages" id="lan-select">
            <option value="">SPECIAL TOPIC</option>
            <option value="english">CHILDREN BOOKS</option>
            <option value="german">BIOGRAPHIES</option>
            <option value="polish">QUARTERLY TOPICS</option>
            <option value="french">SCIENCE FICTION</option>
          </select>
        </div>
      </div>

      <div id="bottom">
        <div id="results">
          <ListEntry v-for="p in points" :data="p" @click="zoomToPoint(p)"></ListEntry>
        </div>

        <l-map ref="map" v-model:zoom="zoom" :minZoom="10" :center="[52.5105, 13.4061]">
          <l-tile-layer :url="maptilerUrl"></l-tile-layer>
          <l-marker v-for="p in points" :lat-lng="p.geometry.coordinates.toReversed()"></l-marker>
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

html, body {
	margin: 0;
	height: 100%;
	font-family: "Compagnon-Medium", sans-serif;
}

#container {
	margin: 0;
	height: 100%;
	display: flex;
	flex-direction: column;
}

#top {
	display: flex;
}

#title {
	background-color: #ACBE8B;
	padding: 24px;
}

#title p{
	font-family: "Compagnon-Bold", serif;
	font-size: 56px;
	margin: 0;
}

#title logo{
	width: 400px;
	padding: 24px;
	font-family: "Compagnon-Bold", serif;
	font-size: 16px;
}

#controls {
	width: 100%;
	background-color: #ACBE8B;
	padding: 24px;
	display: flex;
	flex-flow: wrap;
	max-width: -webkit-fill-available;
}

.tag {
	font-size: 16px;
	border: none;
	font-family: "Compagnon-Medium", sans-serif;
	padding: 8px 16px;
}

.tag:hover, select:hover {
  background-color: #8F1409;
  cursor: pointer;
}

.tag:active {
  box-shadow:
    inset -2px -2px 3px rgba(255, 255, 255, 0.6),
    inset 2px 2px 3px rgba(0, 0, 0, 0.6);
}

.tag:visited {
	background-color: purple;
}

select {
	font-size: 16px;
	font-family: "Compagnon-Medium", sans-serif;
	border: none;
	padding: 8px 8px 8px 16px;
}

select, .tag {
	background-color: #0A278B;
	color: #ACBE8B;
	margin-bottom: 16px;
	margin-right: 16px;
}

#bottom {
	display: flex;
	height: 100%;
	overflow: hidden;
}

#results {
	width: 400px;
	height: 100%;
	background-color: #ACBE8B;
	padding: 8px;
	overflow: scroll;
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
</style>

<script>
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { LMap, LMarker, LTileLayer } from "@vue-leaflet/vue-leaflet";

import ListEntry from './components/ListEntry.vue';
import TagButton from './components/TagButton.vue';

export default {
  beforeMount() {
    this.getPoints();
  },
  components: {
    ListEntry,
    LMap,
    LMarker,
    LTileLayer,
    TagButton
  },
  data() {
    return {
      allPoints: [], // before filtering
      points: [],
      maptilerId: "basic-v2-light/256",
      maptilerApi: "h24s9QHr7NmztAXKJCDP",
      zoom: 12,
    };
  },
  computed: {
    maptilerUrl() {
      return `https://api.maptiler.com/maps/${this.maptilerId}/{z}/{x}/{y}.png?key=${this.maptilerApi}`
    }
  },
  methods: {
    getPoints() {
      fetch('/map_data.geojson')
        .then(response => response.json())
        .then(data => { this.allPoints = data; this.points = data })
    },
    onTagClick(e) {
      // filter the points list based on whether they have that tag
      this.points = this.allPoints.filter((p) => p.properties[e.target.dataset.filter]);
    },
    zoomToPoint(p) {
      console.log(this.$refs.map);
      this.$refs.map.leafletObject.flyTo(p.geometry.coordinates.toReversed(), 15);
    },
  }
};
</script>
