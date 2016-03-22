# Notes

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

## La gestion des SVG

Comme précisé pour le logo en SVG, toutes les illustrations sont externalisées en `<symbol>` dans un fichier SVG séparé. L'idée est de profiter du cache navigateur et de n'avoir qu'un seul accès serveur.

Pour la gestion de la couleur, hors-mis pour le logo, j'ai voulu qu'elle soit de base héritée de la couleur de la police du parent le plus proche sur lequel elle est définie. Cela m'est permis grâce à ça:

```css
svg {
    fill: currentColor;
}

```

Fourberie ! Je n'ai plus ensuite qu'à définir une `color` sur ce svg ou un de ces parents pour changer sa couleur.

Concernant le dimensionnement, là c'était chaud ! Je voulais  pouvoir dimensionner la largeur d'un `<svg>`, et qu'il se dimensionne en hauteur tout seul en gardant sa proportion.

Je vais passer le détail de mes tests, mais j'ai trouvé une solution pas trop moche en lisant [cet article de CSS-Tricks](https://css-tricks.com/scale-svg/). La solution que j'ai préférée est simplement de recopier la propriété `viewbox` du `<symbol>` sur le `<svg>`. <del>Le navigateur (récent) gardera tout seul de ratio en fonction de la taille dimensionnée.</del> <ins>Malheureusement, encore une fois Safari iOS fait ch\*\*\* et oblige à définir également la hauteur, qui semble par défaut être égale à la hauteur du viewport. N'importe quoi ! -_-v</ins>

## La grille CSS

Je ne voulais surtout pas d'une énième grille utilisant des flottants qui font ch***. C'est moche, ça pue, c'est dépassé.

J'ai préféré tenter l'approche par flexbox, qui me semblait plus flexible (!), et suffisamment compatible (comparé à grid).

L'idée était donc d'avoir autant de colonnes qu'on veut, mais avec l'obligation de définir une largeur minimum, ce qui va fatalement définir le nombre maximum de colonne.

Au vu des maquettes, j'ai défini la largeur maximum de la grille à 60em (équivalent à 960px), des gouttières à 1.25em (équivalent à 20px), <del>et une largeur minimum des colonnes à 15em, ce qui délimite le nombre de colonnes possible à trois</del> <ins>et je calcule la largeur des colonnes en divisant la largeur de la grille par le nombre de colonnes voulu + 1, mais sans y soustraire les gouttières, ce qui définit en fin de compte une largeur __minimum__ sous laquelle ne pas réduire</ins>.

Le dimensionnement de ces colonnes étant défini par `flex-grow` et `flex-shrink`, identiques pour toutes les colonnes, elles seront donc aux mêmes dimensions, de manière fluide, jusqu'à la largeur minimum choisie, définie par `flex-basis`. Le tout en shorthand via `flex`.

## La gestion responsive

Puisque la grille est gérée par flexbox, une grande partie est déjà géree. Cependant, la taille de la police peut sembler très grande sur mobile.

J'ai hésité à utilisé l'unité `wv` pour la taille de police&hellip; mais non. J'ai donc tout mis en `em`, je profite donc d'un héritage jusqu'au root `<html>`. C'est sur celui-ci que je diminue ou augmente la `font-size` en fonction de la largeur du média.

## L'auto prefixage

Malheureusement, puisque le site est hébergé sur GitHub, le plugin Autoprefixer de Jekyll est apparemment bloqué (d'après @DirtyF).

Le plus gros problème que cela implique vient de l'utilisation de flexbox, notamment pour la grille, qui est pourtant [bien supporté](http://caniuse.com/flexbox). L'[issue #51](https://github.com/sudweb/2016/issues/51) montre qu'encore une fois c'est Safari qui fait ch\*\*\*.

Donc pas le choix, j'ai du prefixer à la main via mixins. Merci d'ailleurs à @mastastealth pour [son aide](https://github.com/mastastealth/sass-flex-mixin/blob/master/_flexbox.scss). J'ai tout de même laisser les écritures valides en commentaires juste à côté de chaque include pour simplifier la future évolution.

## L'animation du header

Bien sûr, hors de question d'utiliser du javascript ici.

Je tente donc de mettre des animations sur le `<nav>` et le `<header>`, mais impossible de toucher les éléments imbriqués, donc obligé de décomposer en plusieurs `@keyframes` en espérant que la synchronisation de chaque animation subsiste.

Une première version fonctionne donc avec une animation sur le `<header>` qui consiste à alterner la couleur d'arrière plan, et également son image. Mais voilà, il semble que ce ne soit une possibilité récente, qui ne fonctionne actuellement que sous Chrome.

L'alternative que j'ai choisie est d'utiliser les deux pseudo-éléments `::before` et `::after` configurés pour être placés derrière le contenu textuel et recouvrir tout le `<header>`. Un des deux est caché par défaut.

Ça fonctionne.

Un autre bug : il semble qu'une animation d'une marge à 0 vers auto (sur le content du header) ne fonctionne que sous Chrome également. J'ai donc dû faire cette animation de 0 vers 35%, soit 100% moins la largeur du contenu de 65% sur desktop.
