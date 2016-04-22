require 'digest/md5'

module Jekyll
  module Md5Filter
    def md5(input)
      Digest::MD5.hexdigest(input.to_s.strip)
    end
  end
end

Liquid::Template.register_filter(Jekyll::Md5Filter)
