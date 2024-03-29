/*global jQuery, window*/

(function ($) {
    'use strict';

    var $win = $(window),
        Point,
        Rect,
        Lazyloader,
        Viewport,
        Img,
        uniqueId;

    uniqueId = (function () {
        var id = 0;

        return function (prefix) {
            id += 1;

            return undefined !== prefix ? prefix + id : id;
        };
    }());

    Point = function (x, y) {
        this.x = x;
        this.y = y;
    };
    Point.prototype = {
        copy: function () {
            return new Point(this.x, this.y);
        }
    };

    Rect = function (topleft, bottomright) {
        this.topleft = topleft;
        this.bottomright = bottomright;
    };
    Rect.prototype = {
        width: function () {
            return this.topleft.x + this.bottomright.x;
        },
        height: function () {
            return this.topleft.y + this.bottomright.y;
        },
        copy: function () {
            return new Rect(this.topleft.copy(), this.bottomright.copy());
        },
        contains: function (point) {
            var contains = false;

            if (
                point.y >= this.topleft.y &&
                point.y <= this.bottomright.y &&
                point.x >= this.topleft.x &&
                point.x >= this.bottomright.x
            ) {
                contains = true;
            }

            return contains;
        },
        overlaps: function (rect) {
            var contains = false;

            if (
                this.contains(rect.topleft) ||
                    this.contains(rect.bottomright) ||
                    rect.contains(this.topleft) ||
                    rect.contains(this.bottomright)
                ) {
                contains = true;
            }

            return contains;
        }
    };

    Img = function ($el) {
        this.$el = $el;
    };
    Img.prototype = {
        load: function () {
            var onload = jQuery.proxy(function () {
                    this.$el.trigger('lazy-loaded');
                    this.$el.off('load', onload);
                }, this);

            this.$el.on('load', onload);
            this.$el.attr('src', this.$el.data('original'));
        },
        getRect: function () {
            var offset = this.$el.offset(),
                top = offset.top,
                left = offset.left,
                height = this.$el.height(),
                width = this.$el.width();

            return new Rect(new Point(left, top), new Point(left + width, top + height));
        }
    };

    Viewport = function ($el) {
        this.$el = $el;
    };
    Viewport.prototype = {
        getRect: function () {
            var top = this.$el.scrollTop(),
                left = this.$el.scrollLeft(),
                height = this.$el.height(),
                width = this.$el.width();

            return new Rect(new Point(left, top), new Point(left + width, top + height));
        }
    };

    Lazyloader = function (viewport) {
        this.viewport = viewport;
        this.images = {};
        this.count = 0;

        this.viewport.$el.on('scroll load resize', jQuery.proxy(this.checkImages, this));
    };
    Lazyloader.prototype = {
        checkImages: function () {
            var rect = this.viewport.getRect();

            jQuery.each(this.images, jQuery.proxy(function (id, img) {
                if (rect.overlaps(img.getRect())) {
                    img.load();
                    delete this.images[id];
                }
            }, this));
        },
        addImage: function ($img) {
            this.count += 1;
            this.images['image-' + uniqueId()] = new Img($img);
        }
    };

    $.fn.lazyLoad = function ($viewport) {
        var lazyloader;

        $viewport = undefined === $viewport ? $win : $viewport;

        lazyloader = new Lazyloader(new Viewport($viewport));

        return this.each(function () {
            lazyloader.addImage($(this));
        });
    };
}(jQuery));