# Sud Web 2016

Site internet du cycle de conférences annuel Sud Web, dont la 6e édition aura lieu à Bordeaux les 17 et 18 mai 2016.

[http://sudweb.fr/2016](http://sudweb.fr/2016)

## Pré-requis
Vous devez avoir une version de Ruby supérieure à la version 2 sur votre machine.
Nous vous recommandons de gérer l'installation de Ruby via [rbenv](http://rbenv.org/).

Sous Mac OS X, vous pouvez l'installer simplement via Homebrew
```bash
$ brew install rbenv ruby-build
```
Pour installer la verion 2.2.3 de Ruby
```bash
$ rbenv install 2.2.3
```
Pour définir la version utilisée localement pour l'application:
```bash
$ rbenv local 2.2.3
```
Pour vérifier la version de Ruby utilisée :
```bash
rbenv version
ruby 2.2.3
```

## Installation

Commencez par cloner le dépot :
```bash
git clone https://github.com/sudweb/2016.git 2016 && cd 2016
```

Puis exécutez la commande suivante pour installer [Jekyll](http://jekyllrb.com/) :
```bash
bundle install
```
## Utilisation

Pour travailler sur le site et surveiller les modifications :
```bash
$ jekyll serve
Configuration file: <LOCAL_PATH>/2016/_config.yml
            Source: <LOCAL_PATH>/2016
       Destination: <LOCAL_PATH>/2016/_site
      Generating...
                    done.
 Auto-regeneration: enabled for \'<LOCAL_PATH>/2016\'
Configuration file: <LOCAL_PATH>/2016/_config.yml
    Server address: http://0.0.0.0:4000/2016/
  Server running... press ctrl-c to stop.
```



Pour plus d'information sur l'utilisation de Jekyll, reportez-vous à la [documentation officielle](http://jekyllrb.com/docs/home/).

## Contribution

Pour toute demande, merci de [créer une issue](https://github.com/sudweb/2016/issues/new) sur GitHub.

Si vous souhaitez nous aider, vous pouvez [copier](https://help.github.com/articles/fork-a-repo/) le dépôt, faire vos modifications dans une nouvelle branche, et [faire une demande de fusion](https://github.com/sudweb/2016/pulls).

## Licence

Ce code est publié sous licence MIT.
