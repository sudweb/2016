# Sud Web 2016

[![Build Status](https://travis-ci.org/sudweb/2016.svg)](https://travis-ci.org/sudweb/2016)

Site internet du cycle de conférences annuel Sud Web, dont la 6e édition aura lieu à Bordeaux les 27 et 28 mai 2016.

[http://sudweb.fr/2016](http://sudweb.fr/2016)

## Pré-requis
Le site est géré via [Github Pages](https://pages.github.com/) et [Jekyll](http://jekyllrb.com/) et nécessite Ruby 2.1.x (voir `.ruby-version`)

Nous vous recommandons de gérer l'installation de Ruby via [rbenv](http://rbenv.org/).

Sous Mac OS X, vous pouvez utiliser [Homebrew](http://brew.sh/) pour cela
```bash
$ brew install rbenv ruby-build
```

## Installation

Si vous n'avez pas déjà cloné le dépot :
```bash
$ git clone https://github.com/sudweb/2016.git 2016 && cd 2016
```
Si bundler n'est pas installé
```bash
$ gem install bundler
```
Pour installer toutes les dépendances du projet :
```bash
$ bundle install
```
Pour installer la bonne version de Ruby
```bash
$ rbenv install
```

## Travailler en local

Pour travailler sur le site et surveiller les modifications :
```bash
$ bundle exec foreman start  
```

Si vous modifiez le fichier `_config.yml`, il faut lancer
```bash
$ bundle exec jekyll build   
```
Le site est maintenant accessible en local à l'adresse http://0.0.0.0:4000/2016/

Pour plus d'information sur l'utilisation de Jekyll, reportez-vous à la [documentation officielle](http://jekyllrb.com/docs/home/).

## Styleguide et notes d'intégration

* [Styleguide](http://sudweb.fr/2016/styleguide/)
* [Notes d'intégration](notes-integration.md) de @Twikito

## Contribution

Pour toute demande, merci de [créer une issue](https://github.com/sudweb/2016/issues/new) sur GitHub.

Si vous souhaitez nous aider, vous pouvez [copier](https://help.github.com/articles/fork-a-repo/) le dépôt, faire vos modifications dans une nouvelle branche et [faire une demande de fusion](https://github.com/sudweb/2016/pulls).

Toute modification doit faire l'objet d'une [pull request](https://github.com/sudweb/2016/pulls) et doit passer les tests avant de pouvoir être fusionnée.

## Tests

Avant de soumettre votre pull request, lancez le script de test d'intégration continue :

```bash
$ script/cibuild
Running ["ScriptCheck", "LinkCheck", "ImageCheck"] on ./_site on *.html...

HTML-Proofer finished successfully.
```

## Licence

Ce code est publié sous licence MIT.
