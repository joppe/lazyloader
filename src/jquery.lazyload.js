/*global jQuery, window*/

(function ($) {
    'use strict';

    var $win = $(window),
        Point,
        Rect,
        Lazyloader,
        Element,
        Win,
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

    Element = function ($el) {
        this.$el = $el;
    };
    Element.prototype = {
        getRect: function () {
            var offset = this.$el.offset(),
                top = offset.top,
                left = offset.left,
                height = this.$el.height(),
                width = this.$el.width();

            return new Rect(new Point(left, top), new Point(left + width, top + height));
        }
    };

    Img = function ($el) {
        this.$el = $el;
        this.el = new Element(this.$el);
    };
    Img.prototype = {
        load: function () {
            this.$el.attr('src', this.$el.data('original'));
        },
        getRect: function () {
            return this.el.getRect();
        }
    };

    Win = (function () {
        return {
            getRect: function () {
                var top = $win.scrollTop(),
                    left = $win.scrollLeft(),
                    height = $win.height(),
                    width = $win.width();

                return new Rect(new Point(left, top), new Point(left + width, top + height));
            }
        };
    }());

    Lazyloader = function (viewport) {
        this.viewport = viewport;
        this.images = {};
        this.count = 0;

        $win.on('scroll load resize', jQuery.proxy(this.checkImages, this));
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
        var viewport,
            lazyloader;

        if (undefined === $viewport) {
            viewport = Win;
        } else {
            viewport = new Element($viewport);
        }

        lazyloader = new Lazyloader(viewport);

        return this.each(function () {
            lazyloader.addImage($(this));
        });
    };
}(jQuery));