---
layout: default
title: "Styleguide"
description: "Documentation des composants d'interface du site"
excerpt: "Styleguide : couleurs, typographie, UI patterns et composants"
permalink: /styleguide/
---


<div class="wrapper container">

<h1>{{ page.title }}</h1>

{% assign entries = site.colors %}
{% assign componentsByType = site.components | group_by:"type" %}

  <nav id="component-selector" class="wrap">
    <form>
      <select name="newurl" id="component-select" onChange="window.location.replace(this.options[this.selectedIndex].value)">
        <option value="">Sélectionner un composant</option>
        <option value="#guide-color-palettes">Couleurs</option>
        {% for type in componentsByType %}
        <option value="#guide-{{ type.name }}">{{ type.name | capitalize }}</option>
        {% for entry in type.items %}
        <option value="#guide-{{ entry.title | slugify }}">&nbsp;&nbsp;&nbsp;{{ entry.title }}</option>
        {% endfor %}
        {% endfor %}
      </select>
    </form>
  </nav>

  <h2 id="guide-color-palettes" class="cf">Couleurs</h2>
  {% for entry in entries %}
    {% include component-color.html %}
  {% endfor %}
  {% for type in componentsByType %}
  <h2 id="guide-{{ type.name }}" class="cf">{{ type.name | capitalize }}</h2>
  {% for entry in type.items %}
  {% include component.html %}
  {% endfor %}
  {% endfor %}
</div>
