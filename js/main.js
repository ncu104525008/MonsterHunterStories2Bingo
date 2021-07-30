(function (window, $, Cookies, undefined) {
    var darkMode = Cookies.get('darkMode');
    if (darkMode == 1) {
        $('body').addClass('dark-mode');
        $('#light-switch').text('開燈');
        $('#light-switch').removeClass('link-secondary');
        $('#light-switch').addClass('link-light');
    }
    var blocks = $('.block');
    var skillInfo = null;

    // 基因特徵的引索
    var skillFeatureIndex = {
        1: {
            type: -1,
            acction: -1,
        }
    };

    // 賓果的固定計算條件 (反正方格固定是3x3，規則 hardcode 就好了)
    const bingoRule = [
        [1,2,3],
        [4,5,6],
        [7,8,9],
        [1,4,7],
        [2,5,8],
        [3,6,9],
        [1,5,9],
        [3,5,7],
    ];
    const CALC_BINGO_SHOW_DEFAULT = 6; // 計算完賓果後，預設只顯示五組
    const CALC_BINGO_SP_FEATURE = '_';
    const CALC_BINGO_SP_BLOCK = ', ';

    const FEATURE_ROOT_NAME ={
        'action' : '猜拳',
        'type' : '屬性',
    };
    const FEATURE_INDEX = {
        'action' : {
            1 : '力量',
            2 : '技巧',
            3 : '速度',
        },
        'type': {
            1 : '無',
            2 : '火',
            3 : '水',
            4 : '雷',
            5 : '冰',
            6 : '龍',
        },
    }


    /**
     * 從 div 中取得 skill 資訊
     */
    function getSkillFromDiv() {
        var skill = [];
        $('.block').each(function () {
            skill.push($(this).data('id'));
        });
        return skill;
    }

    /**
     *
     * @param int[] input 需要計算的基因id，以陣列輸入，ex: [1,2,3,4,5,6,7,8,9]
     * @param Object sort 要排序的規則，格式 [ ['type', 1], ['type', 2], ['acction', 2] ]
     * @param int[] lock 要鎖住不更換位置的 blockID，以陣列形式輸入，ex: [1, 3, 5] (註: id從1起算)
     */
    function calcBingo(input, sort, lock, show) {
        show = parseInt(show)?parseInt(show):CALC_BINGO_SHOW_DEFAULT;
        lock = Array.isArray(lock)?lock:[];
        input = input.filter(function(value) {
            return !!value;
        });
        if (input.length != 9) {
            return {
                success: false,
                msg: '必須選定9組基因',
            }
        }

        // 把基因內容進行分類
        var featureGroup = {};
        $.each(input, function(doesntmatter, skillID) {

            // 取得特徵的key
            var featureKey = getFeatureKey(skillID);

            // 如果有基因不存在於index裡面代表有問題
            if (!featureKey) {
                return {
                    success: false,
                    msg: '不存在的基因資料? ('+skillID+')',
                }
            }

            featureGroup[featureKey] = !!featureGroup[featureKey]?featureGroup[featureKey]:[];
            featureGroup[featureKey].push(skillID);
        });

        var mainMap={};
        var sortMap={};
        var totalMap=0;
        blockDistributor(featureGroup);

        // 遞迴，每次排列後把分配歷程傳遞給下一回圈，直到沒有東西可以分配代表一組賓果分配完畢了。則可以檢核並儲存。
        function blockDistributor(source, history) {
            history = !!history?history:"";
            // 只要還有東西就代表還需要分配
            if (!$.isEmptyObject(source)) {
                // foreach 逐一進行分配
                $.each(source, function(featureKey, idArr) {
                    // 記錄分配歷程
                    var thisHistory = history?history+CALC_BINGO_SP_BLOCK+featureKey:featureKey;

                    // 分配完後移除以分配的物件 (用深複製避免變數互相影響)
                    var less = $.extend(true, {}, source);
                    less[featureKey].shift();
                    if (less[featureKey].length == 0) {
                        delete(less[featureKey]);
                    }

                    // 繼續往下分配
                    blockDistributor(less, thisHistory);
                });

            // 沒有東西代表上一層分配已經把東西配完了，則可以開始計算賓果結果
            } else {
                var result = {};
                var historyData = history.split(CALC_BINGO_SP_BLOCK);
                var bingoSum = 0;
                $.each(bingoRule, function(bingoRuleKey, eachRule) {
                    var featureTypeMatch = {};
                    var featureActionMatch = {};
                    $.each(eachRule, function(doesntmatter, blockID){
                        var eachFeatureData = historyData[blockID-1].split(CALC_BINGO_SP_FEATURE);
                        // 彩虹的意思是：讓另外兩個自己去比較特徵。所以遇到彩虹基因時，直接不把彩虹列入比對就可以了
                        if (eachFeatureData[0] != -1) {
                            featureTypeMatch[eachFeatureData[0]] = true;
                        }
                        if (eachFeatureData[0] != -1) {
                            featureActionMatch[eachFeatureData[1]] = true;
                        }
                    });

                    // 如果只有一個key 代表賓果了
                    var bingoKey;
                    if ((bingoKey = Object.keys(featureTypeMatch)).length==1) {
                        bingoKey = bingoKey[0];
                        result['type'] = result['type']?result['type']:{};
                        result['type'][bingoKey] = result['type'][bingoKey]?result['type'][bingoKey]:0;
                        result['type'][bingoKey]++;

                        bingoSum++;
                    }
                    if ((bingoKey = Object.keys(featureActionMatch)).length==1) {
                        bingoKey = bingoKey[0];
                        result['action'] = result['action']?result['action']:{};
                        result['action'][bingoKey] = result['action'][bingoKey]?result['action'][bingoKey]:0;
                        result['action'][bingoKey]++;


                        bingoSum++;
                    }
                });

                totalMap++; // 順便記錄一下有幾種組合 (not important)

                // 如果有賓果到再存起來就好
                if (!$.isEmptyObject(result)) {
                    mainMap[history] = result;
                    var sortKey = [];
                    if (!$.isEmptyObject(sort)) {
                        $.each(sort, function(doesntmatter, featureData) {
                            var targetFeature = featureData[0];
                            var featureID = featureData[1];
                            switch (targetFeature) {
                                case '_sum':
                                    sortKey.push(String(bingoSum).padStart('2', '0'));
                                    break;
                                case 'type':
                                case 'action':
                                    var thisKey = !!result[targetFeature] && !!result[targetFeature][featureID]?result[targetFeature][featureID]:0;
                                    thisKey = String(thisKey).padStart('2', '0'); // 因為要轉成字串做排序，所以數字的位數必須一致
                                    sortKey.push(thisKey);
                                    break;

                                default:
                                    //donoting
                            }
                        });
                    }
                    sortKey.push(String(bingoSum).padStart('2', '0')); // 因為要轉成字串做排序，所以數字的位數必須一致
                    sortKey = sortKey.join('#');
                    sortMap[sortKey] = sortMap[sortKey]?sortMap[sortKey]:[];
                    sortMap[sortKey].push(history);
                }
            }
        }

        // 取出具最優解的 key (最符合指定排序者)
        var max = Object.keys(sortMap).sort().pop();

        // 取出最優解們
        var maxGroup = sortMap[max];

        // 好了準備把資料送回去了
        var bestSolution = {};
        $.each(maxGroup, function(key, mapResult) {
            if (key >= show) {
                return false;
            }
            bestSolution[mapResult] = mainMap[mapResult];
        });
        return {
            success: true,
            msg: '分析成功',
            data: bestSolution,
        }
    }

    function getFeatureKey(skillID) {
        var featureData = skillFeatureIndex[skillID];
        if (!featureData) {
            return '';
        }
        return featureData.type+CALC_BINGO_SP_FEATURE+featureData.acction;
    }

    function autoCalc() {
        var skill = getSkillFromDiv(); // 取得頁面中的基因格資訊
        var sort = [ // 取得排序依據
            $('#calc-sort-1').val().split('-'),
            $('#calc-sort-2').val().split('-'),
        ];
        var lock = []; // 未實作
        var show = CALC_BINGO_SHOW_DEFAULT;
        var calcResult = calcBingo(skill, sort, lock, show);

        if (!calcResult['success']) {
            Dialogify.alert('分析失敗: '+calcResult['msg']);
        } else {
            var html='';
            html+= '<div class="row">';
            $.each(calcResult['data'], function(map, bingoInfo) {
                html+='<div class="col-sm-12 col-md-6"><div class="row" style="margin-bottom:20px">';
                html+='<div class="col-6">';
                // 切割為陣列
                var mapArr = map.split(CALC_BINGO_SP_BLOCK);
                var newSkillParm = [];
                var tmpSkill = Object.assign({}, skill);
                var mapHtml = '<div class="row" >';
                $.each(mapArr, function(doesntmatter, feature) {
                    var featureData = feature.split(CALC_BINGO_SP_FEATURE);
                    var type = featureData[0];
                    var action = featureData[1];
                    mapHtml+='<div class="col-4 demo-block"><img class="icon" src="images/icon/'+action+'/'+type+'.png"></div>';

                    // 建立新的 url Parm
                    $.each(tmpSkill, function(skillKey, skillID) {
                        if (getFeatureKey(skillID) != feature) {
                            return;
                        }
                        newSkillParm.push(skillID);
                        delete(tmpSkill[skillKey]);
                        return false;
                    });
                });
                mapHtml+='</div>';
                html+= '<a href="?skills='+(newSkillParm.join(','))+'">'+mapHtml+'</a>';
                html+= '</div>';

                var bingoInfoString = [];
                $.each(FEATURE_INDEX, function(featureRoot, featureData) {
                    $.each(featureData, function(featureKey, featureName) {
                        if (!bingoInfo[featureRoot] || ! bingoInfo[featureRoot][featureKey]) {
                            return;
                        }
                        var bingoNum = bingoInfo[featureRoot][featureKey];
                        var rootName = FEATURE_ROOT_NAME[featureRoot];
                        var str = featureName+' '+rootName+': x'+bingoNum;
                        bingoInfoString.push(str);
                    });
                })
                bingoInfoString = bingoInfoString.join('<br>', bingoInfoString);
                html+= '<div class="col-6"><div>賓果結果:<p style="margin-left:5px;margin-top:10px;">'+bingoInfoString+'</p></div></div>';
                html+= '</div></div>';
            });
            html+='</div>';


            var dailog = new Dialogify('<div style="width: 90%; margin: 0 auto;">'+html+'</div>', {
                size: 'demo-dialog',
            });
            dailog.title('計算結果');
            dailog.showModal();
        }

    }


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
        var h = $('.block').eq(0).width();
        blocks.each(function () {
            var o = $(this);
            o.css('height', h + 'px');
        });
    };

    var setSkillButton = function () {
        $.ajax({
            url: 'ajax/data.json',
            method: 'GET',
            dataType: 'json',
        }).done(function (data) {
            var html = '';
            html += '<div class="col-12" style="margin-top: 5px;"><button class="col-10 text-start btn btn-outline-secondary skill skill-' + data[-1][-1][0].id + '" data-id="1" data-type="-1" data-action="-1"><img class="icon" src="images/icon/-1/-1.png"> ' + data[-1][-1][0].name + '</button><span class="material-icons align-text-bottom" style="cursor: pointer;" onclick="getSkillInfo(1);">help_outline</span></div>';

            for (var i=1;i<=6;i++) {
                for (var j=1;j<=4;j++) {
                    $.each(data[i][j], function (k, v) {
                        skillFeatureIndex[v.id] = {
                            type: i,
                            acction: j,
                        };
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

                        html += '<div class="col-12" style="margin-top: 5px;"><button class="col-10 text-start btn btn-outline-secondary skill skill-' + v.id + '" data-id="' + v.id + '" data-type="' + i + '" data-action="' + j + '" data-type2="' + v.type2 + '"' + t + '><img class="icon" src="images/icon/' + j + '/' + i + '.png"> ' + v.name + '</button><span class="material-icons align-text-bottom" style="cursor: pointer;" onclick="getSkillInfo(' + v.id + ');">help_outline</span></div>';
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
        $('.skill[data-type=-1][data-action=-1]').parent().show();

        var types = $('.filter-btn.is-checked[data-type=type]');
        var actions = $('.filter-btn.is-checked[data-type=action]');
        var showSkillType = parseInt($('[name=showSkillType]:checked').val(), 10);

        types.each(function () {
            var type = $(this);
            actions.each(function () {
                var action = $(this);

                var selector = '';
                if (showSkillType === 2) {
                    selector = '.skill[data-type=' + type.data('id') + '][data-action=' + action.data('id') + '][data-type2=主動]';
                } else if (showSkillType === 3) {
                    selector = '.skill[data-type=' + type.data('id') + '][data-action=' + action.data('id') + '][data-type2=被動]';
                } else {
                    selector = '.skill[data-type=' + type.data('id') + '][data-action=' + action.data('id') + ']';
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

        if (blockClick.hasClass('clean-block')) {
            var block = blockClick.parents('.block');
            var skillId = block.data('id');

            setBlock(block, 0);
            enableSkill(skillId);
            return false;
        }

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
        var action = 0;
        var name = '請先選擇基因';

        if (skillId !== 0) {
            var skill = $('.skill-' + skillId);
            type = skill.data('type');
            action = skill.data('action');
            name = skill.html() + '<span class="material-icons clean-block">delete</span>';
        }

        block.data('id', skillId);
        block.data('type', type);
        block.data('action', action);
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
        var action = [];

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

            var action1 = parseInt(block1.data('action'));
            var action2 = parseInt(block2.data('action'));
            var action3 = parseInt(block3.data('action'));

            if (action1 === action2 && action2 === action3) {
                action.push(action1);
            } else if (action1 === -1 && action2 === action3) {
                action.push(action2);
            } else if (action2 === -1 && action1 === action3) {
                action.push(action1);
            } else if (action3 === -1 && action1 === action2) {
                action.push(action1);
            }
        }

        var typeText = {1: '無', 2: '火', 3: '水', 4: '雷', 5: '冰', 6: '龍'};
        var actionText = {1: '力量', 2: '技巧', 3: '速度', 4: '無'};

        var count = {};
        for (var i=0;i<type.length;i++) {
            count[type[i]] = count[type[i]] ? count[type[i]] + 1 : 1;
        }

        for (var i=1;i<=6;i++) {
            var rate = 100;
            if (count[i]) {
                if (count[i] <= 2) {
                    rate += 10 * count[i];
                } else {
                    rate += 20 + (count[i] - 2) * 5;
                }
            }

            var target = $('div[data-bingo-type=type][data-feature-key='+i+']').find('.bingo-value');
            if (rate > 100) {
                target.addClass('match-bingo');
            } else {
                target.removeClass('match-bingo');
            }
            target.text(rate);

        }

        count = {};
        for (var i=0;i<action.length;i++) {
            count[action[i]] = count[action[i]] ? count[action[i]] + 1 : 1;
        }

        for (var i=1;i<=3;i++) {
            var rate = 100;
            if (count[i]) {
                if (count[i] <= 2) {
                    rate += 10 * count[i];
                } else {
                    rate += 20 + (count[i] - 2) * 5;
                }
            }


            var target = $('div[data-bingo-type=action][data-feature-key='+i+']').find('.bingo-value');
            if (rate > 100) {
                target.addClass('match-bingo');
            } else {
                target.removeClass('match-bingo');
            }
            target.text(rate);
        }

    };

    var getSkillInfo = function (id) {
        if (skillInfo === null) {
            $.ajax({
                url: 'ajax/skill_info.json',
                method: 'GET',
                dataType: 'json',
                beforeSend: function() {
                    var darkMode = Cookies.get('darkMode');
                    options = {closable: false};
                    if (darkMode == 1) {
                        options = {
                            closable: false,
                            size: 'dark-mode',
                        };
                    }
                    new Dialogify('<p>讀取中...</p>', options).showModal();
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

        var options = {};
        if (Cookies.get('darkMode') == 1) {
            options = {size: 'dark-mode'};
        }
        var dialog = new Dialogify('#skill-info-template', options);
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
        $('.skill:disabled').each(function () {
            enableSkill($(this).data('id'));
        });

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

    var toggleDarkMode = function () {
        var darkMode = Cookies.get('darkMode');

        if (darkMode == 1) {
            Cookies.set('darkMode', 0);
            $('#light-switch').text('關燈');
            $('#light-switch').addClass('link-secondary');
            $('#light-switch').removeClass('link-light');
            $('body').removeClass('dark-mode');
        } else {
            Cookies.set('darkMode', 1);
            $('#light-switch').text('開燈');
            $('#light-switch').removeClass('link-secondary');
            $('#light-switch').addClass('link-light');
            $('body').addClass('dark-mode');
        }
    };

    window.getSkillInfo = getSkillInfo;
    window.clearBingo = clearBingo;
    window.saveBingo = saveBingo;
    window.loadBingo = loadBingo;
    window.loadBingoToBlock = loadBingoToBlock;
    window.delBingo = delBingo;
    window.copyUrl = copyUrl;
    window.toggleDarkMode = toggleDarkMode;
    window.autoCalc = autoCalc;
}) (window, jQuery, Cookies);