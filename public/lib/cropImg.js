// http://jsfiddle.net/ergec/qBMwB/
(function ($) {
    $.fn.extend({
        esRePosition: function (options) {
            var defaults = {
                replica: "replica",
                input: "input"
            };

            //Plugin options
            options = $.extend(defaults, options);

            var o = options;
            var dfd = $.Deferred();

            //Main object
            var $mask = $(this);
            var $img = $mask.find('img');
            var $imgSrc = o.path || $img.attr('src');
            $imgSrc = $imgSrc ? $imgSrc.split('/').pop() : undefined;
            var $btn = $mask.parent().find('button');

            var $mask_h = $mask.height();
            var $mask_w = $mask.width();

//            var $photo_org_h = $img.height();
//            var $photo_org_w = $img.width();

            var $photo_h = $img.height();
//            var $photo_w = $img.width();

            var $max_margin = ($photo_h - $mask_h) * -1;
            var $topmarginpx = null;

            $btn.on('click', function(){
                var obj = {
                    offsetY: $topmarginpx * -1,
                    cropheight: $mask_h,
                    cropwidth: $mask_w,
                    src: $imgSrc
                };
                $img.draggable('disable');
                dfd.resolve(obj);
            });

            $img.draggable({
                axis: "y",
                cursor: "move",
                drag: function (event, ui) {
//                    console.log(ui.position);
//                    console.log($max_margin);

                    if(ui.position.top <= $max_margin){
                        ui.position.top = $max_margin;
                    }

                    if(ui.position.top > 0){
                        ui.position.top = 0;
                    }

                    $topmarginpx = ui.position.top;
                }
            });

            return dfd.promise();
        }
    });
})(jQuery);

//http://stackoverflow.com/questions/7850673/is-there-a-jquery-image-cropping-plugin-similar-to-facebooks-image-crop
(function($) {
    $.fn.croppable = function(settings) {
        settings = settings || {
            x: 400,
            y: 200,
            default: 'middle',
            id: $(this).data("id"),
            success: null
        };


        console.log($(this));

        var position = {
            x: settings.default == 'middle' ? ($(this).width() / 2) - (settings.x / 2) : 0 ,
            y: settings.default == 'middle' ? ($(this).height() / 2) - (settings.y / 2) : 0
        };

        $(this).wrap("<div class='croppable-container' style='position: relative;' />");

        var cropper = $("<div style='position: absolute; top: " + position.y +
            "px; left: " + position.x + "px; height: " + settings.y +
            "px; width: " + settings.x + "px;' class='cropper' />");

        $(this).before(cropper);

        var save = $("<input type='button' value='Crop Selection'/>");

        save.click(function () {
            $.post("/your/service/location",
                {
                    img: id,
                    x: cropper.position().left,
                    y: cropper.position().top,
                    height: settings.y,
                    width: settings.x
                },
                function (data) {
                    if (settings.success != null) {
                        settings.success(data);
                    }
                }
            );
        });

        $(this).parent().width($(this).width());
        $(this).parent().height($(this).height());

        cropper.draggable({containment: "parent"});

        $(this).parent().after(save);


    };
})(jQuery);