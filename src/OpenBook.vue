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
      showControls: true, 
      showResults: false,
    };
  },
  computed: {
    maptilerUrl() {
      return `https://api.maptiler.com/maps/${this.maptilerId}/{z}/{x}/{y}.png?key=${this.maptilerApi}`
    },
    points() {
      let points = this.allPoints;
      for (let [field, ...values] of this.filter) {
        points = points.filter((p) => {
          if (Array.isArray(p[field])) { return values.some((val) => p[field].includes(val));}
          else return values.includes(p[field]);
        }); 
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
      // this method is called when an entry is toggleFilter on the map
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
        console.log(values);
        this.filter.push([field, ...values]);
      }
    },
    toggleFilter(filter) {
      const [field, ...values] = filter;
      const isAlreadyActive = this.filter.findIndex((f) => f[0] === field && f[1] === values[0]);
      if (isAlreadyActive === -1) {
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
      console.log(e.target.value);
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
      this.showResults = ! this.showResults;
    }
  }
};
</script>

<template>
    <div id="container">
      <div id="top">
        <div id="title">
          <p id="logo">OpenBook</p>
          <p id="logoMobile">oo</p>
          <div id="menuButtons">
            <button id="readmore" type="button">About</button>
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
          <div id="controls" v-if="!$isMobile() || showResults">
          <!-- changing the selection applies a filter that field 'name' needs to have value 'value' -->
          <select name="type" @change="toggleSelect($event)" id="type-select" :class="{active: this.isActiveFilter('type')}">
            <option value="">TYPE</option>
            <option value="bookshop">BOOKSTORE</option>
            <option value="library">LIBRARY</option>
            <option value="street_lib">STREET LIBRARY</option>
          </select>

          <!-- second_hand tag according to https://wiki.openstreetmap.org/wiki/Key:second_hand -->
          <TagButton @toggleFilter="toggleFilter" :filter="['second_hand', 'yes', 'only']" label="second hand" :isActive="this.isActiveFilter('second_hand')" />
          <!-- openstreetmap has no events tag, needs to be added to the entries manually -->
          <TagButton @toggleFilter="toggleFilter" :filter="['events', true]" label="events" :isActive="this.isActiveFilter('events')" />
          <!-- same -->
          <TagButton @toggleFilter="toggleFilter" :filter="['coffee', true]" label="coffee/snack" :isActive="this.isActiveFilter('snacks')"/>

          <select name="languages" @change="toggleSelect" id="lan-select" :class="{active: this.isActiveFilter('languages')}">
            <option value="">LANGUAGE</option>
            <option value="Arabic">Arabic</option>
            <option value="Chinese">Chinese</option>
            <option value="Danish">Danish</option>
            <option value="Dutch">Dutch</option>
            <option value="English">English</option>
            <option value="French">French</option>
            <option value="Greek">Greek</option>
            <option value="Hebrew">Hebrew</option>
            <option value="Italian">Italian</option>
            <option value="Japanese">Japanese</option>
            <option value="Korean">Korean</option>
            <option value="Latin">Latin</option>
            <option value="Norwegian">Norwegian</option>
            <option value="Persian">Persian</option>
            <option value="Polish">Polish</option>
            <option value="Portugues">Portugues</option>
            <option value="Russian">Russian</option>
            <option value="Spanish">Spanish</option>
            <option value="Swedish">Swedish</option>
            <option value="Turkish">Turkish</option>
            <option value="Ukrainian">Ukrainian</option>
            <option value="Vietnamese">Vietnamese</option>
          </select>

          <!-- 3 more fields which are not tagged by openstreetmap, so will need to be added manually -->
          <TagButton @toggleFilter="toggleFilter" :filter="['lessons', true]" label="lessons" :isActive="this.isActiveFilter('lessons')" />
          <TagButton @toggleFilter="toggleFilter" :filter="['opening_hours', true]" label="open after 6pm" :isActive="this.isActiveFilter('opening_hours')" />
          <TagButton @toggleFilter="toggleFilter" :filter="['wheelchair', 'yes', 'limited']" label="wheelchair" :isActive="this.isActiveFilter('wheelchair')" />

          <select name="topics" @change="toggleSelect" id="topic-select" :class="{active: this.isActiveFilter('topics')}">
            <option value="">SPECIAL TOPIC</option>
            <option value="Children's books">Children's books</option>
            <option value="Design">Design</option>
            <option value="Architecture">Architecture</option>
            <option value="Art">Art</option>
            <option value="Bauhaus">Bauhaus</option>
            <option value="Science Fiction">Science Fiction</option>
            <option value="Fantasy">Fantasy</option>
            <option value="Crimes">Crimes</option>
            <option value="Photography">Photography</option>
            <option value="Typography">Typography</option>
            <option value="Interior design">Interior design</option>
            <option value="Theater">Theater</option>
            <option value="Music">Music</option>
            <option value="Film">Film</option>
            <option value="City">City</option>
            <option value="Politics">Politics</option>
            <option value="Pop">Pop</option>
            <option value="Economic Criticism">Economic Criticism</option>
            <option value="Theory">Theory</option>
            <option value="African literature">African literature</option>
            <option value="Afrodiasporic literature">Afrodiasporic literature</option>
            <option value="Comics">Comics</option>
            <option value="Manga">Manga</option>
            <option value="Artist's books">Artist's books</option>
            <option value="North American studies">North American studies</option>
            <option value="Boardgames">Boardgames</option>
            <option value="Vampires">Vampires</option>
            <option value="Young Adult">Young Adult</option>
            <option value="Pop">Pop</option>
            <option value="Economics">Economics</option>
            <option value="Management">Management</option>
            <option value="Medicine">Medicine</option>
            <option value="Psychology">Psychology</option>
            <option value="Kurdology">Kurdology</option>
            <option value="Kurdish Studies">Kurdish Studies</option>
            <option value="Maritime">Maritime</option>
            <option value="Youth">Youth</option>
            <option value="Subcultures">Subcultures</option>
            <option value="Picture books">Picture books</option>
            <option value="Christian">Christian</option>
            <option value="Anarchism">Anarchism</option>
            <option value="Travel">Travel</option>
            <option value="Fashion">Fashion</option>
            <option value="Astrology">Astrology</option>
            <option value="Zen">Zen</option>
            <option value="Yoga">Yoga</option>
            <option value="Meditation">Meditation</option>
            <option value="Rail transport">Rail transport</option>
            <option value="Judaism">Judaism</option>
            <option value="Queer">Queer</option>
            <option value="LBGTI+">LBGTI+</option>
            <option value="Care">Care</option>
            <option value="Grief">Grief</option>
            <option value="Hospice">Hospice</option>
            <option value="Theology">Theology</option>
            <option value="Community work">Community work</option>
            <option value="Catechesis">Catechesis</option>
            <option value="Ecumenism">Ecumenism</option>
            <option value="Spirituality">Spirituality</option>
            <option value="Asian studies">Asian studies</option>
            <option value="African studies">African studies</option>
            <option value="Islamic Theology">Islamic Theology</option>
            <option value="Graphic novel">Graphic novel</option>
            <option value="Silent Books">Silent Books</option>
            <option value="History and Life in Communism">History and Life in Communism</option>
            <option value="History of socialism">History of socialism</option>
            <option value="History of workers' movement">History of workers' movement</option>
            <option value="Art and literature of classical modernism">Zen</option>
            <option value="The artistic avant-gardes of Easter Europe">The artistic avant-gardes of Eastern Europe</option>
            <option value="Kabbalah">Kabbalah</option>
            <option value="Political philosophy">Political philosophy</option>
            <option value="Art theory">Art theory</option>
            <option value="Film theory">Film theory</option>
            <option value="Queer studies">Queer studies</option>
            <option value="Gender studies">Gender studies</option>
            <option value="Postcolonial studies">Postcolonial studies</option>
            <option value="Education">Education</option>
            <option value="Pedagogy">Pedagogy</option>
            <option value="Vegan">Vegan</option>
            <option value="Musicology">Musicology</option>
            <option value="Sub/cultural and natural phenomena">Sub/cultural and natural phenomena</option>
            <option value="Berlin's history">Berlin's history</option>
            <option value="German studies">German studies</option>
            <option value="Scandinavian studies">Scandinavian studies</option>
            <option value="Feminist literature">Feminist literature</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Persian">Persian</option>
            <option value="Jewish history">Jewish history</option>
            <option value="Jewish culture">Jewish culture</option>
            <option value="China">China</option>
            <option value="Maps">Maps</option>
            <option value="Travel guides">Travel guides</option>
            <option value="Travel reports">Travel reports</option>
            <option value="Globes">Globes</option>
            <option value="Atlases">Atlases</option>
          </select>
          <TagButton @toggleFilter="toggleFilter" label=""/>
          <TagButton @toggleFilter="toggleFilter" label=""/>
          <TagButton @toggleFilter="toggleFilter" label=""/>
          <TagButton id="goToResults" @click="showResults" label="Go to results" v-if="showResults"/>
        </div>
        </div>
      </div>

      <div id="bottom">
        <div id="results" v-if="!showResults">
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

#logoMobile {
  display: none;
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
  font-size: 16px;
}

#readmore:hover, #bingo:hover, #github:hover {
  color: #8F1409;
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
  border-radius: 0px;
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
  text-transform: uppercase;
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

@media only screen and (max-width: 600px) {

  #top {
    flex-direction: column;
  }

  #title {
    width: 100%;
    box-sizing: border-box;
    flex-direction: row;
    justify-content: space-between;
    padding-left: 12px;
    line-height: 20px;
    align-items: baseline;
  }

  #logo {
    display: none;
  }

  #logoMobile {
    display: block;
  }

  #menuButtons {
    padding-left: 12px;
    padding-right: 12px;
  }

  #menuButtons button{
    font-size: 18px;
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
    overflow-y: hidden;
  }

  .result_item {
    width: 100%;
    box-sizing: border-box;
  }
}
</style>
