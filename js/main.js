(function (window, $, undefined) {
    var blocks = $('.block');
    var skillInfo = null;

    $(function () {
        setSkillButton();
        $('.filter-btn').on('click', filterButtonClick);
        $('#only-best').on('change', filterSkill);
        $('[name=showSkillType]').on('change', filterSkill);

        $(window).on('resize', resizeBlock);
        $(window).trigger('resize');
        blocks.on('click', clickBlock);

        $('#share-url').val(location.protocol + '://' + location.host + location.pathname);
    });

    var resizeBlock = function () {
        blocks.each(function () {
            var o = $(this);
            o.css('height', o.width() + 'px');
        });
    };

    var setSkillButton = function () {
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
            $('.skill:enabled').on('click', clickSkill);

            filterSkill();
            setDefaultSkill();
        });
    };

    var filterButtonClick = function (e) {
        var obj = $(e.target);

        var color = obj.data('color');
        obj.toggleClass('btn-outline-' + color);
        obj.toggleClass('btn-' + color);
        obj.toggleClass('is-checked');

        filterSkill();
    };

    var clickSkill = function (e) {
        var skillClick = $(e.target);
        var flag = skillClick.hasClass('btn-outline-secondary');
        $('.skill:enabled').removeClass('btn-secondary');
        $('.skill:enabled').addClass('btn-outline-secondary');

        if (flag) {
            skillClick.removeClass('btn-outline-secondary');
            skillClick.addClass('btn-secondary');

            var blockSelected = $('.block.is-selected');
            if (blockSelected.length > 0) {
                var skillId = skillClick.data('id');
                setBlock(blockSelected, skillId);
                disableSkill(skillId);
                blockSelected.removeClass('is-selected');
            }
        }
    };

    var filterSkill = function () {
        $('.skill').removeClass('is-hide');
        $('.skill').parent().hide();
        $('.skill[data-type=-1][data-attr=-1]').parent().show();

        var types = $('.filter-btn.is-checked[data-type=type]');
        var attrs = $('.filter-btn.is-checked[data-type=attr]');
        var showSkillType = parseInt($('[name=showSkillType]:checked').val(), 10);

        types.each(function () {
            var type = $(this);
            attrs.each(function () {
                var attr = $(this);

                var selector = '';
                if (showSkillType === 2) {
                    selector = '.skill[data-type=' + type.data('id') + '][data-attr=' + attr.data('id') + '][data-type2=主動]';
                } else if (showSkillType === 3) {
                    selector = '.skill[data-type=' + type.data('id') + '][data-attr=' + attr.data('id') + '][data-type2=被動]';
                } else {
                    selector = '.skill[data-type=' + type.data('id') + '][data-attr=' + attr.data('id') + ']';
                }
                $(selector).parent().show();
            });
        });

        onlyShowBest();
    };

    var onlyShowBest = function () {
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
    };

    var setDefaultSkill = function () {
        var skills = location.search;
        if (skills.length === 0) {
            return false;
        }
        skills = skills.split('=');
        skills = skills[1].split(',');
        skills = skills.slice(0, 9);

        $.each(skills, function (k, v) {
            if (v === 'NaN' || isNaN(v)) {
                v = 0;
            }

            setBlock($('.block-' + (k+1)), v);
            disableSkill(v);
        });
    }

    var clickBlock = function (e) {
        var skillSelected = $('.skill.btn-secondary:enabled');
        var blockSelected = $('.block.is-selected');
        var blockClick = $(e.target);

        for (var i=0;i<2;i++) {
            if (blockClick.hasClass('block') === false) {
                blockClick = blockClick.parent();
            }
        }

        if (skillSelected.length > 0) {
            var nowId = parseInt(blockClick.data('id'), 10);

            if (nowId !== 0) {
                enableSkill(nowId);
            }

            var id = skillSelected.data('id');
            setBlock(blockClick, id);
            disableSkill(id);
        } else if (blockSelected.length > 0) {
            var id1 = blockSelected.data('id');
            var id2 = blockClick.data('id');

            setBlock(blockSelected, id2);
            setBlock(blockClick, id1);

            blockSelected.removeClass('is-selected');
        } else {
            blockClick.addClass('is-selected');
        }
    };

    var setBlock = function (block, skillId) {
        skillId = parseInt(skillId, 10);
        var type = 0;
        var attr = 0;
        var name = '請先選擇基因';

        if (skillId !== 0) {
            var skill = $('.skill-' + skillId);
            type = skill.data('type');
            attr = skill.data('attr');
            name = skill.html();
        }

        block.data('id', skillId);
        block.data('type', type);
        block.data('attr', attr);
        block.html('<div>' + name + '</div>');

        checkBingo();

        var skills = '';
        $('.block').each(function () {
            var o = $(this);
            if (skills.length === 0) {
                skills += '' + o.data('id');
            } else {
                skills += ',' + o.data('id');
            }
        });

        var url = location.protocol + '//' + location.host + location.pathname + '?skills=' + skills;
        window.history.pushState('', '魔物基因配置模擬器', '?skills=' + skills);

        $('#share-url').val(url);
    };

    var enableSkill = function (skillId) {
        var obj = $('.skill-' + skillId);
        obj.prop('disabled', false);
        obj.addClass('btn-outline-secondary');
        obj.removeClass('btn-secondary');
    };

    var disableSkill = function (skillId) {
        var obj = $('.skill-' + skillId);
        obj.prop('disabled', true);
        obj.addClass('btn-secondary');
        obj.removeClass('btn-outline-secondary');
    };

    var checkBingo = function () {
        var type = [];
        var attr = [];

        for (var i=1;i<=8;i++) {
            var blockInLine = $('.line-' + i);
            var block1 = blockInLine.eq(0);
            var block2 = blockInLine.eq(1);
            var block3 = blockInLine.eq(2);

            var type1 = parseInt(block1.data('type'));
            var type2 = parseInt(block2.data('type'));
            var type3 = parseInt(block3.data('type'));

            if (type1 === type2 && type1 === type3) {
                type.push(type1);
            } else if (type1 === -1 && type2 === type3) {
                type.push(type2);
            } else if (type2 === -1 && type1 === type3) {
                type.push(type1);
            } else if (type3 === -1 && type1 === type2) {
                type.push(type1);
            }

            var attr1 = parseInt(block1.data('attr'));
            var attr2 = parseInt(block2.data('attr'));
            var attr3 = parseInt(block3.data('attr'));

            if (attr1 === attr2 && attr2 === attr3) {
                attr.push(attr1);
            } else if (attr1 === -1 && attr2 === attr3) {
                attr.push(attr2);
            } else if (attr2 === -1 && attr1 === attr3) {
                attr.push(attr1);
            } else if (attr3 === -1 && attr1 === attr2) {
                attr.push(attr1);
            }
        }

        var typeText = {1: '無', 2: '火', 3: '水', 4: '雷', 5: '冰', 6: '龍'};
        var attrText = {1: '力量', 2: '技巧', 3: '速度', 4: '無'};

        var html = '';
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
    };

    var getSkillInfo = function (id) {
        if (skillInfo === null) {
            $.ajax({
                url: 'ajax/skill_info.json',
                method: 'GET',
                dataType: 'json',
                beforeSend: function() {
                    new Dialogify('<p>讀取中...</p>', {closable: false}).showModal();
                }
            }).done(function (data) {
                skillInfo = data;
                Dialogify.closeAll();
                showSkillInfo(id);
            });
        } else {
            showSkillInfo(id);
        }
    };

    var showSkillInfo = function (id) {
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
    };

    var clearBingo = function () {
        setBlock($('.block'), 0);
        $('.block').removeClass('is-selected');

        $('.skill').prop('disabled', false);
        $('.skill').addClass('btn-outline-secondary');
        $('.skill').removeClass('btn-secondary');
    };

    var saveBingo = function () {
        Dialogify.prompt('請輸入模板名稱', {
            placeholder: '未輸入時，將以「未命名模板」儲存',
            ok: function (name) {
                if (name.length === 0) {
                    name = '未命名模板';
                }

                var skills = [];
                $('.block').each(function () {
                    skills.push($(this).data('id'));
                });
                saveBingoData({name: name, skills: skills});
            }
        });
    };

    var getBingoData = function () {
        var data = window.localStorage.getItem('bingoData');
        if (data === null) {
            return [];
        }

        return JSON.parse(data);
    };

    var saveBingoData = function (data) {
        var bingoData = getBingoData();

        bingoData.push(data);
        var bingoDataJson = JSON.stringify(bingoData);
        window.localStorage.setItem('bingoData', bingoDataJson);
        Dialogify.alert('儲存成功');
    };

    var loadBingo = function () {
        var bingoData = getBingoData();
        var html = '';

        $.each(bingoData, function (k, v) {
            html += '<div class="row" style="margin-top: 10px;">';
            html += '<div class="col-10"><button class="btn btn-primary text-left" style="width: 100%" onclick="loadBingoToBlock(' + k + ');">' + v.name + '</button></div>';
            html += '<div class="col-2"><button class="btn btn-secondary" onclick="delBingo(' + k + ');">刪除</button></div>'
            html += '</div>';
        });

        if (html.length === 0) {
            html += '<p>目前無紀錄</p>';
        }

        new Dialogify(html, {size: Dialogify.SIZE_LARGE, useDialogForm: false}).showModal();
    };

    var loadBingoToBlock = function (id) {
        var bingoData = getBingoData();
        var skills = bingoData[id].skills;

        $.each(skills, function (k, v) {
            var block = $('.block-' + (k+1));
            setBlock(block, v);
            disableSkill(v);
        });

        Dialogify.closeAll();
    };

    var delBingo = function (id) {
        Dialogify.confirm('是否確定要刪除？', {
            ok: function() {
                var bingoData = getBingoData();

                var tmp = [];
                $.each(bingoData, function (k, v) {
                    if (k !== id) {
                        tmp.push(v);
                    }
                });
                window.localStorage.setItem('bingoData', JSON.stringify(tmp));
                Dialogify.closeAll();
                Dialogify.alert('刪除成功');
            }
        });
    };

    var copyUrl = function () {
        var urlObj = $('#share-url');

        if (navigator.userAgent.match('/iPhone|iPod|iPad/i')) {
            var el = urlObj.get(0);
            el.contentEditable = true;
            el.readOnly = false;

            var range = document.createRange();
            range.selectNodeContents(el);
            var sel = window.getSelection();

            sel.removeAllRanges();
            sel.addRange(range);
            el.setSelectionRange(0, 999999);
            el.contentEditable = false;
            el.readOnly = true;
        } else {
            urlObj.select();
        }

        document.execCommand('copy');
        urlObj.blur();

        Dialogify.alert('複製成功');
    };

    window.getSkillInfo = getSkillInfo;
    window.clearBingo = clearBingo;
    window.saveBingo = saveBingo;
    window.loadBingo = loadBingo;
    window.loadBingoToBlock = loadBingoToBlock;
    window.delBingo = delBingo;
    window.copyUrl = copyUrl;
}) (window, jQuery);