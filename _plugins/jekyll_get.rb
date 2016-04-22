require 'json'
require 'hash-joiner'
require 'open-uri'
require 'safe_yaml/load'

module Jekyll_Get
  class Generator < Jekyll::Generator
    safe true
    priority :highest

    def generate(site)
      config = SafeYAML.load(
        ERB.new(site.config['jekyll_get'].to_yaml).result(binding)
      )

      if !config
        return
      end
      if !config.kind_of?(Array)
        config = [config]
      end
      config.each do |d|
        begin
          target = site.data[d['data']]
          source = JSON.load(open(d['json']))
          if target
            HashJoiner.deep_merge target, source
          else
            site.data[d['data']] = source
          end
          if d['cache']
            data_source = (site.config['data_source'] || '_data')
            path = "#{data_source}/#{d['data']}.json"
            open(path, 'wb') do |file|
              file << JSON.generate(site.data[d['data']])
            end
          end
        rescue
          next
        end
      end
    end
  end
end
