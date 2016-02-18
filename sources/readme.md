# Notes

## Le logo en SVG

J'ai d'abord pensé mettre tous les SVG en haut de la page HTML, déclarés en symboles, mais j'ai ensuite tenté de les insérer par ressource externe.

L'idée était de voir si le `<use>` pouvait désormais fonctionner avec une ressource externe, et sélectionner un symbole comme ceci :

```html
<svg class="sw-logo">
	<use xlink:href="img/assets/symbol-defs.svg#sw-logo" />
</svg>
```

Et là ça marche ! \o/

Ok, cool. Maintenant l'idée est de voir si je peux ne déclarer qu'une seule fois le symbole du logo, et changer ses couleurs en fonction du contexte, donc toucher au shadow DOM via CSS.

Je tente :

```scss
.sw-logo {
	[id='sw-heart'] {
		fill: $red;
	}
}

```

Et là ça ne fonctionne malheureusement que sur Firefox. C'était couru d'avance. Mais ça marche quand même sur Firefox.
Donc l'idée ensuite est de modifier le code pour que ça fonctionne partout, mais de permettre de ne modifier que peu de choses pour revenir à ce code idéal.

La meilleure solution que j'ai trouvée : insérer le viewbox côté HTML et décomposer l'insertion, mais ne pas toucher au symbole SVG.

```html
<svg class="sw-logo regular" viewBox="0 0 500 276.37">
	<use id="sw-hands" xlink:href="img/assets/symbol-defs.svg#sw-hands" />
	<use id="sw-hands-shadows" xlink:href="img/assets/symbol-defs.svg#sw-hands-shadows" />
	<use id="sw-heart" xlink:href="img/assets/symbol-defs.svg#sw-heart" />
	<use id="sw-heart-top" xlink:href="img/assets/symbol-defs.svg#sw-heart-top" />
	<use id="sw-wave-shadow" xlink:href="img/assets/symbol-defs.svg#sw-wave-shadow" />
	<use id="sw-wave" xlink:href="img/assets/symbol-defs.svg#sw-wave" />
</svg>
```

Pas génial, mais ainsi lorsque les navigateurs seront prêts, il n'y aura qu'à remettre le code HTML plus haut. Pas besoin de toucher au SCSS, ni au symbole SVG.

## Charte de codage CSS

Basiquement, il existe deux méthode de codage CSS : en monoligne ou multiligne.

La première a l’avantage de mettre en évidence les sélecteurs, mais rend difficilement lisible les déclarations ; la deuxième rend les déclarations facilement lisibles mais les sélecteurs deviennent très éloignés.

La méthode multiligne est de loin la plus répandue.

La deuxième chose qui me défrise littéralement est qu’avec cette méthode, nos écrans devenus de plus en plus larges ne sont pas exploités : la feuille de style utilise pour ainsi dire les 50 premières colonnes de caractère, et c’est tout.

À noter que j’utilisais la méthode monoligne à mes débuts.

La lecture du livre « CSS Maintenables » m’a permis d’établir une charte de codage qui, à mon sens, exploite l’avantage des deux méthodes et en apporte d’autres.

```CSS
foo {
       line 1: box styles;
       line 2: flex styles;
       line 3: transform styles;
       line 4: border styles;
       line 5: background styles;
       line 6: text styles;
       line 7: other styles;
       line 8: animation and transition styles;
   }
```

Ainsi, chaque règle ne fera que huit lignes au miximum (visibilité des sélecteurs), et exploite la largeur de l'écran.

De plus, chaque déclaration est rangée dans un ordre logique, ce qui permet de les retrouver rapidement.

## La grille CSS

Je ne voulais surtout pas d'une énième grille utilisant des flottants qui font ch***. C'est moche, ça pue, c'est dépassé.

J'ai préféré tenter l'approche par flexbox, qui me semblait plus flexible (!), et suffisamment compatible (comparé à grid).

L'idée était donc d'avoir autant de colonnes qu'on veut, mais avec l'obligation de définir une largeur minimum, ce qui va fatalement définir le nombre maximum de colonne.

Au vu des maquettes, j'ai défini la largeur maximum de la grille à 60em (équivalent à 960px), des gouttières à 1.25em (équivalent à 20px), et une largeur minimum des colonnes à 15em, ce qui délimite le nombre de colonnes possible à trois.

Le dimensionnement de ces colonnes étant défini par le flex-grow et flex-shrink, identiques pour toutes les colonnes, elles seront donc aux mêmes dimensions, de manière fluide, jusqu'à une largeur minimum de 15em, défini par flex-basis. Le tout en shorthand via flex.
