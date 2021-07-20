<!DOCTYPE html>
<html lang="zh-TW-Hant">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>魔物基因配置模擬器</title>

    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous">

    <style>
        .block {
            border-style: solid;
        }
    </style>
</head>
<body>
    <div class="container-fluid" style="margin-top: 50px;">
        <div class="row">
            <div class="col-5">
                <div class="row">
                    <div class="col block block-1 line-1 line-4 line-7" data-id="0">請先選擇基因</div>
                    <div class="col block block-2 line-1 line-5" data-id="0">請先選擇基因</div>
                    <div class="col block block-3 line-1 line-6 line-8" data-id="0">請先選擇基因</div>
                </div>
                <div class="row">
                    <div class="col block block-4 line-2 line-4" data-id="0">請先選擇基因</div>
                    <div class="col block block-5 line-2 line-5 line-7 line-8" data-id="0">請先選擇基因</div>
                    <div class="col block block-6 line-2 line-6" data-id="0">請先選擇基因</div>
                </div>
                <div class="row">
                    <div class="col block block-7 line-3 line-4 line-8" data-id="0">請先選擇基因</div>
                    <div class="col block block-8 line-3 line-5" data-id="0">請先選擇基因</div>
                    <div class="col block block-9 line-3 line-6 line-7" data-id="0">請先選擇基因</div>
                </div>
            </div>
            <div class="col">
                <div class="row bingo">
                    <div class="col-12">屬性</div>
                    <div class="col-12">無：100%</div>
                    <div class="col-12">火：100%</div>
                    <div class="col-12">水：100%</div>
                    <div class="col-12">雷：100%</div>
                    <div class="col-12">冰：100%</div>
                    <div class="col-12">龍：100%</div>
                    <div class="col-12"><hr></div>
                    <div class="col-12">猜拳</div>
                    <div class="col-12">力量：100%</div>
                    <div class="col-12">技巧：100%</div>
                    <div class="col-12">速度：100%</div>
                </div>
            </div>
            <div class="col-4">
                <div class="row">
                    <div class="col">
                        屬性：
                        <button class="btn btn-primary filter-btn" data-id="1" data-type="type">無</button>
                        <button class="btn btn-primary filter-btn" data-id="2" data-type="type">火</button>
                        <button class="btn btn-primary filter-btn" data-id="3" data-type="type">水</button>
                        <button class="btn btn-primary filter-btn" data-id="4" data-type="type">雷</button>
                        <button class="btn btn-primary filter-btn" data-id="5" data-type="type">冰</button>
                        <button class="btn btn-primary filter-btn" data-id="6" data-type="type">龍</button>
                    </div>
                </div>
                <div class="row" style="margin-top: 5px;">
                    <div class="col">
                        猜拳：
                        <button class="btn btn-primary filter-btn" data-id="4" data-type="attr">無</button>
                        <button class="btn btn-primary filter-btn" data-id="1" data-type="attr">力量</button>
                        <button class="btn btn-primary filter-btn" data-id="2" data-type="attr">技巧</button>
                        <button class="btn btn-primary filter-btn" data-id="3" data-type="attr">速度</button>
                    </div>
                </div>
                <div class="row" id="skill-table" style="overflow: scroll; margin-top: 20px; max-height: 80vh;">
                </div>
            </div>
        </div>
    </div>
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script>
        $(function () {
            var block = $('.block');
            block.each(function () {
                var obj = $(this);
                obj.css('height', obj.width() + 'px');
            });

            $('.block').on('click', function () {
                var obj = $('.skill.btn-secondary:enabled');
                if (obj.length > 0) {
                    var nowId = parseInt($(this).data('id'), 10);

                    if (nowId !== 0) {
                        $('.skill-' + nowId).prop('disabled', false);
                        $('.skill-' + nowId).addClass('btn-outline-secondary');
                        $('.skill-' + nowId).removeClass('btn-secondary');
                    }

                    var id = obj.data('id');
                    var type = obj.data('type');
                    var attr = obj.data('attr');

                    var name = $('.skill-' + id).text();

                    $(this).text(name);
                    $(this).data('type', type);
                    $(this).data('attr', attr);
                    $(this).data('id', id);
                    obj.attr('disabled', '');
                }

                check();
            });

            $.ajax({
                url: 'ajax/data.json',
                method: 'GET',
                dataType: 'json',
            }).done(function (data) {
                var html = '';
                html += '<div class="col-12" style="margin-top: 5px;"><button class="btn btn-outline-secondary skill skill-' + data[-1][-1][0].id + '" data-id="1" data-type="-1" data-attr="-1">全/全 ' + data[-1][-1][0].name + '</button></div>';

                for (var i=1;i<=6;i++) {
                    for (var j=1;j<=4;j++) {
                        $.each(data[i][j], function (k, v) {
                            html += '<div class="col-12" style="margin-top: 5px;"><button class="btn btn-outline-secondary skill skill-' + v.id + '" data-id="' + v.id + '" data-type="' + i + '" data-attr="' + j + '">' + v.type + '/' + v.attributes + ' ' + v.name + '</button></div>';
                        });
                    }
                }
                $('#skill-table').html(html);

                $('.skill:enabled').on('click', function () {
                    $('.skill:enabled').removeClass('btn-secondary');
                    $('.skill:enabled').addClass('btn-outline-secondary')
                    $(this).removeClass('btn-outline-secondary')
                    $(this).addClass('btn-secondary');
                });
            });

            $('.filter-btn').on('click', function () {
                $(this).toggleClass('btn-outline-primary');
                $(this).toggleClass('btn-primary');
                filterSkill();
            });
        });

        function filterSkill()
        {
            if ($('.filter-btn.btn-primary').length === 0) {
                $('.skill').parent().show();
                return false;
            }

            $('.skill').parent().hide();
            var btn1 = $('.filter-btn.btn-primary[data-type=type]');
            var btn2 = $('.filter-btn.btn-primary[data-type=attr]');

            btn1.each(function () {
                var b1 = $(this);
                btn2.each(function () {
                    var b2 = $(this);

                    var selector = '.skill[data-type=' + b1.data('id') + '][data-attr=' + b2.data('id') + ']';
                    console.log(selector);
                    $(selector).parent().show();
                });
            });
        }

        function check()
        {
            var type = [];
            var attr = [];

            for (var i=1;i<=8;i++) {
                var objList = $('.line-' + i);
                var type1 = objList.eq(0).data('type');
                var type2 = objList.eq(1).data('type');
                var type3 = objList.eq(2).data('type');

                if (type1 === type2 && type1 === type3) {
                    type.push(objList.eq(0).data('type'));
                } else if (type1 == -1 && type2 === type3) {
                    type.push(objList.eq(0).data('type'));
                } else if (type2 == -1 && type1 === type3) {
                    type.push(objList.eq(0).data('type'));
                } else if (type3 == -1 && type1 === type2) {
                    type.push(objList.eq(0).data('type'));
                }

                var attr1 = objList.eq(0).data('attr');
                var attr2 = objList.eq(1).data('attr');
                var attr3 = objList.eq(2).data('attr');

                if (attr1 === attr2 && attr1 === attr3) {
                    attr.push(objList.eq(0).data('attr'));
                } else if (attr1 == -1 && attr2 === attr3) {
                    attr.push(objList.eq(0).data('attr'));
                } else if (attr2 == -1 && attr1 === attr3) {
                    attr.push(objList.eq(0).data('attr'));
                } else if (attr3 == -1 && attr1 === attr2) {
                    attr.push(objList.eq(0).data('attr'));
                }
            }

            var html = '';

            var typeText = {1: '無', 2: '火', 3: '水', 4: '雷', 5: '冰', 6: '龍'};
            var attrText = {1: '力量', 2: '技巧', 3: '速度', 4: '無'};

            var count = {};
            for (var i=0;i<type.length;i++) {
                count[type[i]] = count[type[i]] ? count[type[i]] + 1 : 1;
            }

            html += '<div class="col-12">屬性</div>';
            for (var i=1;i<=6;i++) {
                var rate = 100;
                if (count[i]) {
                    if (count[i] <= 2) {
                        rate += 10 * count[i];
                    } else {
                        rate += 20 + (count[i] - 2) * 5;
                    }
                }

                html += '<div class="col-12">' + typeText[i] + '：' + rate + '%</div>';
            }

            count = {};
            for (var i=0;i<attr.length;i++) {
                count[attr[i]] = count[attr[i]] ? count[attr[i]] + 1 : 1;
            }

            html += '<div class="col-12"><hr></div>';
            html += '<div class="col-12">猜拳</div>';
            for (var i=1;i<=3;i++) {
                var rate = 100;
                if (count[i]) {
                    if (count[i] <= 2) {
                        rate += 10 * count[i];
                    } else {
                        rate += 20 + (count[i] - 2) * 5;
                    }
                }

                html += '<div class="col-12">' + attrText[i] + '：' + rate + '%</div>';
            }

            $('.bingo').html(html);
        }
    </script>
</body>
</html>
