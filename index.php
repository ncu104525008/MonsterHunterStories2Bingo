<!DOCTYPE html>
<html lang="zh-TW-Hant">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>魔物基因配置模擬器</title>

    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous">
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">

    <style>
        .block {
            border-style: solid;
            font-size: 24px;
        }

        .btn-purple {
            color: #fff;
            background-color: var(--bs-purple);
            border-color: var(--bs-purple);
        }

        .btn-outline-purple {
            color: var(--bs-purple);
            border-color: var(--bs-purple);
        }

        .icon {
            width: 32px;
            height: 32px;
            background-size: auto;
            display: inline-block;
            background-repeat: no-repeat;
            overflow: hidden;
        }

        .skill {
            font-size: 20px;
        }

        .border-top-none {
            border-top: none;
        }

        .border-left-none {
            border-left: none;
        }

        .block.is-selected {
            color: #fff;
            background-color: var(--bs-gray);
            border-color: #000;
        }
    </style>
</head>
<body>
    <div class="container-fluid" style="margin-top: 50px;">
        <div class="row">
            <div class="col-lg-1"></div>
            <div class="col-12 col-lg-4">
                <div class="row">
                    <div class="col block block-1 line-1 line-4 line-7 align-middle" data-id="0" data-type="" data-attr="">請先選擇基因</div>
                    <div class="col block block-2 line-1 line-5 border-left-none" data-id="0" data-type="" data-attr="">請先選擇基因</div>
                    <div class="col block block-3 line-1 line-6 line-8 border-left-none" data-id="0" data-type="" data-attr="">請先選擇基因</div>
                </div>
                <div class="row">
                    <div class="col block block-4 line-2 line-4 border-top-none" data-id="0" data-type="" data-attr="">請先選擇基因</div>
                    <div class="col block block-5 line-2 line-5 line-7 line-8 border-top-none border-left-none" data-id="0" data-type="" data-attr="">請先選擇基因</div>
                    <div class="col block block-6 line-2 line-6 border-top-none border-left-none" data-id="0">請先選擇基因</div>
                </div>
                <div class="row">
                    <div class="col block block-7 line-3 line-4 line-8 border-top-none" data-id="0" data-type="" data-attr="">請先選擇基因</div>
                    <div class="col block block-8 line-3 line-5 border-top-none border-left-none" data-id="0" data-type="" data-attr="">請先選擇基因</div>
                    <div class="col block block-9 line-3 line-6 line-7 border-top-none border-left-none" data-id="0" data-type="" data-attr="">請先選擇基因</div>
                </div>
            </div>
            <div class="col-12 col-lg-3">
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
            <div class="col-12 col-lg-4">
                <div class="row">
                    <div class="col">
                        屬性：
                        <button class="btn btn-outline-secondary filter-btn" data-color="secondary" data-id="1" data-type="type">無</button>
                        <button class="btn btn-outline-danger filter-btn" data-color="danger" data-id="2" data-type="type">火</button>
                        <button class="btn btn-outline-primary filter-btn" data-color="primary" data-id="3" data-type="type">水</button>
                        <button class="btn btn-outline-warning filter-btn" data-color="warning" data-id="4" data-type="type">雷</button>
                        <button class="btn btn-outline-info filter-btn" data-color="info" data-id="5" data-type="type">冰</button>
                        <button class="btn btn-outline-purple filter-btn" data-color="purple" data-id="6" data-type="type">龍</button>
                    </div>
                </div>
                <div class="row" style="margin-top: 5px;">
                    <div class="col">
                        猜拳：
                        <button class="btn btn-outline-secondary filter-btn" data-color="secondary" data-id="4" data-type="attr">無</button>
                        <button class="btn btn-outline-danger filter-btn" data-color="danger" data-id="1" data-type="attr">力量</button>
                        <button class="btn btn-outline-success filter-btn" data-color="success" data-id="2" data-type="attr">技巧</button>
                        <button class="btn btn-outline-primary filter-btn" data-color="primary" data-id="3" data-type="attr">速度</button>
                    </div>
                </div>
                <div class="row" style="margin-top: 5px;">
                    <div class="col">
                        <div class="form-check form-check-inline">
                            <input class="form-check-input" type="radio" name="showSkillType" id="showSkillType1" value="1" checked>
                            <label class="form-check-label" for="showSkillType1">全部顯示</label>
                        </div>
                        <div class="form-check form-check-inline">
                            <input class="form-check-input" type="radio" name="showSkillType" id="showSkillType2" value="2">
                            <label class="form-check-label" for="showSkillType2">只顯示主動</label>
                        </div>
                        <div class="form-check form-check-inline">
                            <input class="form-check-input" type="radio" name="showSkillType" id="showSkillType3" value="3">
                            <label class="form-check-label" for="showSkillType3">只顯示被動</label>
                        </div>
                    </div>
                </div>
                <div class="row" style="margin-top: 5px;">
                    <div class="col">
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" name="only-best" id="only-best">
                            <label class="form-check-label" for="only-best">只顯示最強</label>
                        </div>
                    </div>
                </div>
                <div class="row" id="skill-table" style="overflow-y: scroll; margin-top: 20px; max-height: 80vh;">
                </div>
            </div>
        </div>
    </div>
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="js/dialogify.min.js"></script>
    <script id="skill-info-template" type="text/template">
        <div class="row">
            <div class="col fs-3 info"></div>
        </div>
    </script>
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

                    var name = $('.skill-' + id).html();

                    $(this).html(name);
                    $(this).data('type', type);
                    $(this).data('attr', attr);
                    $(this).data('id', id);
                    obj.attr('disabled', '');
                } else if ($('.block.is-selected').length > 0) {
                    var obj = $('.block.is-selected');
                    var id1 = obj.data('id');
                    var type1 = obj.data('type');
                    var attr1 = obj.data('attr');
                    var name1 = obj.html();

                    var id2 = $(this).data('id');
                    var type2 = $(this).data('type');
                    var attr2 = $(this).data('attr');
                    var name2 = $(this).html();

                    $(this).html(name1);
                    $(this).data('type', type1);
                    $(this).data('attr', attr1);
                    $(this).data('id', id1);

                    obj.html(name2);
                    obj.data('type', type2);
                    obj.data('attr', attr2);
                    obj.data('id', id2);

                    obj.removeClass('is-selected');
                } else {
                    $(this).addClass('is-selected');
                }

                check();
            });

            $.ajax({
                url: 'ajax/data.json',
                method: 'GET',
                dataType: 'json',
            }).done(function (data) {
                var html = '';
                html += '<div class="col-12" style="margin-top: 5px;"><button class="col-10 text-start btn btn-outline-secondary skill skill-' + data[-1][-1][0].id + '" data-id="1" data-type="-1" data-attr="-1"><img class="icon" src="images/icon/-1/-1.png"> ' + data[-1][-1][0].name + '</button><span class="material-icons align-text-bottom" style="cursor: pointer;" onclick="getSkillInfo(1);">help_outline</span></div>';

                for (var i=1;i<=6;i++) {
                    for (var j=1;j<=4;j++) {
                        $.each(data[i][j], function (k, v) {
                            var reg = new RegExp('^(.+)【(.+)】$');
                            var tmp = v.name.match(reg);

                            var t = '';
                            if (tmp) {
                                var level = 1;
                                if (tmp[2] === '小') {
                                    level = 1;
                                } else if (tmp[2] === '中') {
                                    level = 2;
                                } else if (tmp[2] === '大') {
                                    level = 3;
                                } else if (tmp[2] === '特大') {
                                    level = 4;
                                }

                                t += ' data-name="' + tmp[1] + '" data-level="' + level + '"';
                            }

                            html += '<div class="col-12" style="margin-top: 5px;"><button class="col-10 text-start btn btn-outline-secondary skill skill-' + v.id + '" data-id="' + v.id + '" data-type="' + i + '" data-attr="' + j + '" data-type2="' + v.type2 + '"' + t + '><img class="icon" src="images/icon/' + j + '/' + i + '.png"> ' + v.name + '</button><span class="material-icons align-text-bottom" style="cursor: pointer;" onclick="getSkillInfo(' + v.id + ');">help_outline</span></div>';
                        });
                    }
                }
                $('#skill-table').html(html);

                $('.skill:enabled').on('click', function () {
                    var flag = $(this).hasClass('btn-outline-secondary');
                    $('.skill:enabled').removeClass('btn-secondary');
                    $('.skill:enabled').addClass('btn-outline-secondary')

                    if (flag) {
                        $(this).removeClass('btn-outline-secondary');
                        $(this).addClass('btn-secondary');
                    }
                });

                filterSkill();
            });

            $('.filter-btn').on('click', function () {
                var color = $(this).data('color');
                $(this).toggleClass('btn-outline-' + color);
                $(this).toggleClass('btn-' + color);
                $(this).toggleClass('is-checked');
                filterSkill();
            });

            $('#only-best').on('change', onlyShowBest);
            $('[name=showSkillType]').on('change', filterSkill);
        });

        function filterSkill()
        {
            $('.skill').removeClass('is-hide');
            $('.skill').parent().hide();
            $('.skill[data-type=-1][data-attr=-1]').parent().show();
            var btn1 = $('.filter-btn.is-checked[data-type=type]');
            var btn2 = $('.filter-btn.is-checked[data-type=attr]');

            var showSkillType = parseInt($('[name=showSkillType]:checked').val(), 10);
            btn1.each(function () {
                var b1 = $(this);
                btn2.each(function () {
                    var b2 = $(this);

                    var selector = '';
                    if (showSkillType === 2) {
                        selector = '.skill[data-type=' + b1.data('id') + '][data-attr=' + b2.data('id') + '][data-type2=主動]';
                    } else if (showSkillType === 3) {
                        selector = '.skill[data-type=' + b1.data('id') + '][data-attr=' + b2.data('id') + '][data-type2=被動]';
                    } else {
                        selector = '.skill[data-type=' + b1.data('id') + '][data-attr=' + b2.data('id') + ']';
                    }
                    $(selector).parent().show();
                });
            });

            onlyShowBest();
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
                    type.push(objList.eq(2).data('type'));
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
                    attr.push(objList.eq(2).data('attr'));
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

        var skillInfo = null;

        function getSkillInfo(id)
        {
            if (skillInfo === null) {
                new Dialogify('<p>讀取中...</p>', {closable: false}).showModal();
                $.ajax({
                    url: 'ajax/skill_info.json',
                    method: 'GET',
                    dataType: 'json',
                    async: false,
                }).done(function (data) {
                    skillInfo = data;
                    Dialogify.closeAll();
                });
            }

            var data = skillInfo[id];
            var html = '';
            html += '<p>' + data.name + '</p>';
            html += '<p>' + data.skill + '</p>';
            html += '<p>' + data.type + '</p>';
            html += '<p>消耗：' + data.cost + '</p>';
            html += '<p>' + data.desc + '</p>';
            html += '<hr>';
            html += '<p class="fs-5">出處：' + data.from + '</p>';

            var dialog = new Dialogify('#skill-info-template');
            dialog.$content.find('.info').html(html);
            dialog.showModal();
        }

        function onlyShowBest()
        {
            if ($('#only-best').prop('checked') === false) {
                if ($('.skill.is-hide').length > 0) {
                    $('.skill.is-hide').parent().show();
                    $('.skill.is-hide').removeClass('is-hide');
                }
                return false;
            }

            var checkedList = [];

            $('.skill:visible').each(function () {
                var name = $(this).data('name');
                if (checkedList.indexOf(name) === -1) {
                    checkedList.push(name);
                }
            });

            $.each(checkedList, function (k, v) {
                var tmp = [];
                $('.skill[data-name=' + v + ']:visible').each(function () {
                    tmp.push($(this).data('level'));
                    $(this).addClass('is-hide');
                    $(this).parent().hide();
                });

                var bestObj = $('.skill[data-name=' + v + '][data-level=' + Math.max(...tmp) + ']');
                bestObj.parent().show();
                bestObj.removeClass('is-hide');
            });
        }
    </script>
</body>
</html>
