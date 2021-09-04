(function (window, $, Cookies, undefined) {
    var darkMode = Cookies.get('darkMode');
    if (darkMode == 1) {
        $('body').addClass('dark-mode');
        $('#light-switch').text('開燈');
        $('#light-switch').removeClass('link-secondary');
        $('#light-switch').addClass('link-light');
        $('#bingo-switch').removeClass('link-secondary');
        $('#bingo-switch').addClass('link-light');
    }

    var disableBingoLine = Cookies.get('disableBingoLine');
    if (disableBingoLine == 1) {
        $('.bingo-line').addClass('hide');
        $('#bingo-switch').text('顯示賓果線');
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
    const CALC_BINGO_SHOW_DEFAULT = 6; // 計算完賓果後，共顯示幾個圖形
    const CALC_BINGO_SHOW_PRE_SOLUTION_DEFAULT = 2  // 計算完賓果後，每次從每組最佳解中最多取出多少圖形
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
     * 從 div 中取得 lock 資訊
     */
    function getLockFromDiv() {
        var lock = [];
        $('.block span.lock.is-lock').each(function(){
            var blockID = $(this).parents('.block').attr('id').replace(/^[^\d]+/,'');
            lock.push(parseInt(blockID));
        })
        return lock;
    }

    /**
     * 取得任意基因的特徵資訊
     *
     * @param int skillID 基因ID
     */
    function getFeatureKey(skillID) {
        var featureData = skillFeatureIndex[skillID];
        if (!featureData) {
            return '';
        }
        return featureData.type+CALC_BINGO_SP_FEATURE+featureData.acction;
    }

    /**
     *
     * 計算自動排序
     * 用遞迴歸納出所有可能組合，並在每一組組合出爐時直接判斷是否符合賓果規則
     * 有則紀錄之，並歸納進排序內
     *
     *
     * @param int[] input 需要計算的基因id，以陣列輸入，ex: [1,2,3,4,5,6,7,8,9]
     * @param Object sort 要排序的規則，格式 [ ['type', 1], ['type', 2], ['acction', 2] ]
     * @param int[] lock 要鎖住不更換位置的 blockID，以陣列形式輸入，ex: [1, 3, 5] (註: id從1起算)
     * @param int show 要顯示總共幾個結果
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

        var lockData = new Array(9);

        // 把基因內容進行分類
        var featureGroup = {};
        var originFeaturePathData = [];
        $.each(input, function(key, skillID) {

            // 取得特徵的key
            var featureKey = getFeatureKey(skillID);

            // 如果有基因不存在於index裡面代表有問題
            if (!featureKey) {
                return {
                    success: false,
                    msg: '不存在的基因資料? ('+skillID+')',
                }
            }
            if (lock.indexOf(key+1) >= 0) { // 陣列是 0 起算的，但 blockID 是1 起算，所以要+1 補正
                lockData[key] = featureKey;
            } else {
                featureGroup[featureKey] = !!featureGroup[featureKey]?featureGroup[featureKey]:[];
                featureGroup[featureKey].push(skillID);
            }
            originFeaturePathData.push(featureKey);
        });

        var mainMap={};
        var sortMap={};
        var totalMap=0;

        // 不論如何都先針對原始資料進行計算
        var originBingoResult = getBingoResult(originFeaturePathData);

        // 如果原始資料有賓果，則優先將原始資料的特徵路徑塞進 sortMap 當中 (這麼做是為了使: 當原始資料為最優解時，則優先使其顯示)
        if (!$.isEmptyObject(originBingoResult)) {
            var originBingoResultSortKey = getBingoResultSortKey(originBingoResult, sort);
            sortMap[originBingoResultSortKey] = [];
            sortMap[originBingoResultSortKey][0] = [];
            sortMap[originBingoResultSortKey][0].push(originFeaturePathData.join(CALC_BINGO_SP_BLOCK));
        }

        // 遞迴填充 mainMap, sortMap
        blockDistributor(featureGroup);

        // 遞迴，每次排列後把分配歷程傳遞給下一回圈，直到沒有東西可以分配代表一組賓果分配完畢了。則可以檢核並儲存。
        function blockDistributor(source, featurePath) {
            featurePath = !!featurePath?featurePath:"";
            // 只要還有東西就代表還需要分配
            if (!$.isEmptyObject(source)) {
                // foreach 逐一進行分配
                $.each(source, function(featureKey, idArr) {
                    // 記錄分配歷程
                    var thisFeaturePath = featurePath?featurePath+CALC_BINGO_SP_BLOCK+featureKey:featureKey;

                    // 分配完後移除以分配的物件 (用深複製避免變數互相影響)
                    var less = $.extend(true, {}, source);
                    less[featureKey].shift();
                    if (less[featureKey].length == 0) {
                        delete(less[featureKey]);
                    }

                    // 繼續往下分配
                    blockDistributor(less, thisFeaturePath);
                });

            // 沒有東西代表上一層分配已經把東西配完了，則可以開始計算賓果結果
            } else {
                // 把 lock 的東西塞回去，讓長度補足回來
                var featurePathData = featurePath.split(CALC_BINGO_SP_BLOCK);
                $.each(lockData, function(key, eachLockTmp){
                    if (!!eachLockTmp) {
                        featurePathData.splice(key, 0, eachLockTmp);
                    }
                });
                featurePath = featurePathData.join(CALC_BINGO_SP_BLOCK);

                var result = getBingoResult(featurePathData);

                totalMap++; // 順便記錄一下有幾種組合 (not important)

                // 如果有賓果到再存起來就好
                if (!$.isEmptyObject(result)) {
                    mainMap[featurePath] = result;
                    var sortKey = getBingoResultSortKey(result, sort);

                    // 比較一下和原始輸入圖形的差異
                    var diff = 0;
                    $.each(featurePathData, function(key, featureKey) {
                        if (featureKey != originFeaturePathData[key]) {
                            diff++;
                        }
                    });

                    // 因為 input 其實已經計算並塞進 sortMap 過了，所以只有當不相同的時候才需要塞入 sortMap
                    if (!!diff)  {
                        sortMap[sortKey] = sortMap[sortKey]?sortMap[sortKey]:[];
                        sortMap[sortKey][diff] = sortMap[sortKey][diff]?sortMap[sortKey][diff]:[];
                        sortMap[sortKey][diff].push(featurePath);
                    }
                }
            }
        }

        // 取出具最優解的 key (最符合指定排序者)
        if ($.isEmptyObject(sortMap)) {
            return {
                success: false,
                msg: '找不到最優解',
            }
        }
        var sortReverse = Object.keys(sortMap).sort().reverse();

        var bestSolution = {};
        $.each(sortReverse, function(doesntmatter, mapKey) {
            if (Object.keys(bestSolution).length >= show) {
                return false;
            }

            // 把 sortMap[key] 內的資料階層攤平 (因為有先靠 diff 做差異性排列)
            var tmpMapGroup = sortMap[mapKey];
            var mapGroup = [];
            $.each(tmpMapGroup, function(diff, mapContents) {
                if (!!mapContents && mapContents.length > 0) {
                    mapGroup = mapGroup.concat(mapContents);
                }
            });
            $.each(mapGroup, function(conut, mapResult){
                // 每個最佳解群集只取 CALC_BINGO_SHOW_PRE_SOLUTION_DEFAULT 個
                if (conut >= CALC_BINGO_SHOW_PRE_SOLUTION_DEFAULT) {
                    return false;
                }
                bestSolution[mapResult] = mainMap[mapResult];
            });
        });

        return {
            success: true,
            msg: '分析成功',
            data: bestSolution,
        }

        /**
         * 透過 特徵資料 分析賓果結果並回傳
         *
         * @param string[] featurePathData ex :["1_2", "1_3", "1_1", "2_1", "2_2" ....]
         * @return object 賓果結果\
         *   {
         *      type: {
         *        1: 1, // 代表 type1 一條
         *        2: 3, // 代表 type2 三條
         *      },
         *      action: {
         *        3: 4, // 代表 action3 四條
         *      },
         *      _sum: 8, // 代表共 8 條
         *   }
         */
        function getBingoResult(featurePathData) {
            var bingoResult = {};
            var bingoSum = 0;
            $.each(bingoRule, function(bingoRuleKey, eachRule) {
                var featureTypeMatch = {};
                var featureActionMatch = {};
                $.each(eachRule, function(doesntmatter, blockID){
                    var eachFeatureData = featurePathData[blockID-1].split(CALC_BINGO_SP_FEATURE);
                    // 彩虹的意思是：讓另外兩個自己去比較特徵。所以遇到彩虹基因時，直接不把彩虹列入比對就可以了
                    if (eachFeatureData[0] != -1) {
                        featureTypeMatch[eachFeatureData[0]] = true;
                    }
                    if (eachFeatureData[1] != -1) {
                        featureActionMatch[eachFeatureData[1]] = true;
                    }
                });

                // 如果只有一個key 代表賓果了
                var bingoKey;
                if ((bingoKey = Object.keys(featureTypeMatch)).length==1 && bingoKey!=0) {
                    bingoKey = bingoKey[0];
                    bingoResult['type'] = bingoResult['type']?bingoResult['type']:{};
                    bingoResult['type'][bingoKey] = bingoResult['type'][bingoKey]?bingoResult['type'][bingoKey]:0;
                    bingoResult['type'][bingoKey]++;

                    bingoSum++;
                }
                if ((bingoKey = Object.keys(featureActionMatch)).length==1 && bingoKey!=0) {
                    bingoKey = bingoKey[0];
                    bingoResult['action'] = bingoResult['action']?bingoResult['action']:{};
                    bingoResult['action'][bingoKey] = bingoResult['action'][bingoKey]?bingoResult['action'][bingoKey]:0;
                    bingoResult['action'][bingoKey]++;

                    bingoSum++;
                }

                if (!!bingoSum) {
                    bingoResult['_sum'] = bingoSum;
                }
            });

            return bingoResult;
        }

        /**
         * 以賓果結果取得排序用的key
         *
         * @param {*} bingoResult 賓果結果 (資料來源從 getBingoResult() 取得)
         * @param {*} sort 排序規則
         */
        function getBingoResultSortKey(bingoResult, sort) {
            var sortKey = [];
            // 如果有賓果到再存起來就好
            if (!$.isEmptyObject(bingoResult)) {
                if (!$.isEmptyObject(sort)) {
                    $.each(sort, function(doesntmatter, featureData) {
                        var targetFeature = featureData[0];
                        var featureID = featureData[1];
                        switch (targetFeature) {
                            case '_sum':
                                sortKey.push(String(bingoResult['_sum']).padStart('2', '0'));
                                break;
                            case 'type':
                            case 'action':
                                var thisKey = !!bingoResult[targetFeature] && !!bingoResult[targetFeature][featureID]?bingoResult[targetFeature][featureID]:0;
                                thisKey = String(thisKey).padStart('2', '0'); // 因為要轉成字串做排序，所以數字的位數必須一致
                                sortKey.push(thisKey);
                                break;

                            default:
                                //donoting
                        }
                    });
                }
                sortKey.push(String(bingoResult['_sum']).padStart('2', '0')); // 因為要轉成字串做排序，所以數字的位數必須一致
            }
            sortKey = sortKey.join('#');
            return sortKey;
        }
    }

    /**
     * 計算自動排列
     *
     * calcBingo 的前一步驟，會把所需的資料搜集好後送給 calcBingo
     * 並透過 calcBingo 的回傳內容決定該給錯誤訊息還是要顯示結果。
     */
    function autoCalc() {
        var skill = getSkillFromDiv(); // 取得頁面中的基因格資訊
        var sort = [ // 取得排序依據
            $('#calc-sort-1').val().split('-'),
            $('#calc-sort-2').val().split('-'),
        ];
        var lock = getLockFromDiv();
        var show = CALC_BINGO_SHOW_DEFAULT;

        var calcing = new Dialogify('<div style="text-align: center;margin-top: 25px;"><div class="spinner-border" role="status"><span class="sr-only"></span></div></div>');
        calcing.title('計算中請稍候...');
        calcing.showModal();

        // delay 10 ms 後才動作，避免這邊的運算和 Dialogify 撞在一起，loading 會 show 不出來
        setTimeout(function(){
            var calcResult = calcBingo(skill, sort, lock, show);
            calcing.close();

            if (!calcResult['success']) {
                Dialogify.alert('分析失敗：'+calcResult['msg']);
            } else {
                showCalc(calcResult['data'], skill, lock);
            }
        }, 10);

        return;
    }

    /**
     * 組建自動排列的計算結果，並顯示燈箱
     *
     * @param {} soultion  calcBingo() 回傳的 result['data']
     * @param int[] skill 原始基因的輸入陣列，長度為 9 每一個陣列元素對應指定格子中的skillID ex: [1, 2, 3, 4, 5, 6, 7, 8, 9]
     * @param int[] lock  要鎖定的格字編號，元素為要鎖定的編號 ex: [1,4]
     */
    function showCalc(soultion, skill, lock) {
        var html='';
        html+= '<div class="row">';

        $.each(soultion, function(map, bingoInfo) {
            html+='<div class="col-sm-12 col-md-6"><div class="row" style="margin-bottom:20px">';
            html+='<div class="col-6">';
            // 切割為陣列
            var mapArr = map.split(CALC_BINGO_SP_BLOCK);
            // var newSkillParm = [];
            var newSkillParm = new Array(9);
            var tmpSkill = Object.assign({}, skill);
            var mapHtml = '<div class="row" >';

            // 如果有lock 則優先分配 lock 的 skill
            $.each(lock, function(doesntmatter, blockID) {
                var skillKey = blockID-1;
                newSkillParm[skillKey] = tmpSkill[skillKey];
                delete(tmpSkill[skillKey]);
            });

            // 開始組建圖表以及分配剩餘 skill 到 url
            $.each(mapArr, function(key, feature) {
                var featureData = feature.split(CALC_BINGO_SP_FEATURE);
                var type = featureData[0];
                var action = featureData[1];
                mapHtml+='<div class="col-4 demo-block"><img class="icon" src="images/icon/'+action+'/'+type+'.png"></div>'; // 建立圖表內容

                // 分派 skill 到 url Parm (如果已經分配了就不用再分配了)
                if (!!newSkillParm[key]) {
                    return;
                }

                // 從剩餘的skill 裡面找尋相同特徵的基因，一致者就塞入，並且從原物件中移除掉，避免被重複分配。
                $.each(tmpSkill, function(skillKey, skillID) {
                    if (getFeatureKey(skillID) != feature) {
                        return;
                    }
                    newSkillParm[key] = skillID;
                    delete(tmpSkill[skillKey]);
                    return false;
                });
            });
            mapHtml+='</div>';
            var url = buildURL(newSkillParm, false, true);
            html+= '<a href="'+url+'">'+mapHtml+'</a>';
            html+= '</div>';

            // 組建 info 訊息 (顯示幾條就好了)
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
        dailog.title('計算結果<span class="material-icons align-text-bottom" style="cursor: pointer;margin-left:5px" onclick="calcInfo()">help_outline</span>');
        dailog.showModal();

    }

    // lock 點擊後的動作
    $('.lock').on('click', function(){
        if ($(this).parent('.block').data('id') == 0 ) {
            return false;
        }
        $(this).toggleClass('is-lock');
        if ($(this).is('.is-lock')) {
            $(this).text('lock');
        } else {
            $(this).text('lock_open');
        }
        buildURL();
        return false;
    })

    // 顯示自動排列的規則
    function calcInfo() {
        Dialogify.alert('根據你所提供的基因內容，系統目前會依據可達成的賓果圖形：<ul><li>從每種 最優解群集 中取出最多 <b>'+ CALC_BINGO_SHOW_PRE_SOLUTION_DEFAULT +'組</b> 圖形</li><li>並依據若干種最優解群集，取出當中最多總計 <b>'+ CALC_BINGO_SHOW_DEFAULT +'組</b> 圖形</li></ul>以供參考。<br><br>各圖形可點擊，點擊後會連結至對應頁面，以利進行分享/ 儲存。');
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
        var h = $('.block').eq(0).outerWidth()
        blocks.each(function () {
            var o = $(this);
            o.css('height', h + 'px');
        });
        var tableWidth =  $('.bingo-line').parents().outerWidth();
        var rate = tableWidth / $('.bingo-line').outerWidth();

        $('.bingo-line').css('transform', 'scale('+rate+') translateY(-3%)');
    };

    var setSkillButton = function () {
        $.ajax({
            url: 'ajax/data.json',
            method: 'GET',
            dataType: 'json',
        }).done(function (data) {
            var html = '';
            html += '<div class="col-12" style="margin-top: 5px;"><button class="col-10 text-start btn btn-outline-secondary skill skill-' + data[-1][-1][0].id + '" data-id="1" data-type="-1" data-action="-1" data-name="虹色基因"><img class="icon" src="images/icon/-1/-1.png"> ' + data[-1][-1][0].name + '</button><span class="material-icons align-text-bottom" style="cursor: pointer;" onclick="getSkillInfo(1);">help_outline</span></div>';

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
        var urlParams = new URLSearchParams(window.location.search);
        var skills = urlParams.get('skills');
        skills = skills?skills.split(','):[];

        var lock = urlParams.get('lock');
        lock = lock?lock.split(','):[];


        if (skills.length === 0) {
            return false;
        }
        skill = skills.slice(0, 9);

        $.each(lock, function (doesntmatter, blockID) {
            var target = $('#block-' + blockID+' span.lock');
            if (target.length > 0 ) {
                target.addClass('is-lock');
                target.text('lock');
            }
        });

        $.each(skills, function (k, v) {
            if (v === 'NaN' || isNaN(v)) {
                v = 0;
            }
            var blockID = k+1;
            setBlock($('#block-' + blockID), v, false, false);
            disableSkill(v);
        });

        checkBingo();
        buildURL();
    }

    $('.block').on('click', '.clean-block', function(){
        var block = $(this).parents('.block');
        var skillId = block.data('id');

        setBlock(block, 0);
        enableSkill(skillId);
        return false;
    })

    var clickBlock = function (e) {
        var skillSelected = $('.skill.btn-secondary:enabled');
        var blockSelected = $('.block.is-selected');
        var blockClick = $(this);


        if ( blockSelected.children('.lock').is('.is-lock') || blockClick.children('.lock').is('.is-lock')) {
            Dialogify.alert('基因已經鎖定');
            blockSelected.removeClass('is-selected');
            return false;
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

            setBlock(blockSelected, id2, false, false);
            setBlock(blockClick, id1, false, false);

            checkBingo();
            buildURL();

            blockSelected.removeClass('is-selected');
        } else {
            blockClick.addClass('is-selected');
        }
    };

    var setBlock = function (block, skillId, doBuildURL, doCheckBingo) {
        doBuildURL = doBuildURL!==undefined?doBuildURL:true;
        doCheckBingo = doCheckBingo!==undefined?!!doCheckBingo:true;
        skillId = parseInt(skillId, 10);
        var htmlContent = '';

        var skillNameBlock = $('<div></div>').addClass('skill-name-block');
        var type = 0;
        var action = 0;
        var imgUrl = '';
        var name = '請先選擇基因';

        if (skillId !== 0) {
            block.addClass('got-skill');
            var skill = $('.skill-' + skillId);

            type = skill.data('type');
            action = skill.data('action');
            name = skill.text();
            imgUrl = 'images/icon/'+action+'/'+type+'.png';
        } else {
            block.removeClass('got-skill');
            block.children('.lock').text('lock_open').removeClass('is-lock');
        }

        htmlContent = skillNameBlock.html('<div class="skill-name-text">'+name+'</div>');

        block.data('id', skillId);
        block.data('type', type);
        block.data('action', action);
        block.children('.skill-area').html(htmlContent);

        if (imgUrl) {
            block.children('.skill-area').css('background-image','url('+imgUrl+')');
        } else {
            block.children('.skill-area').css('background-image','');
        }

        if (doCheckBingo) {
            checkBingo();
        }

        if (doBuildURL) {
            buildURL();
        }
    };

    function buildURL(skills, lock, justReturn) {
        var skills = !!skills?skills:getSkillFromDiv();
        var lock = !!lock?lock:getLockFromDiv();
        var justReturn = justReturn!==undefined?justReturn:false;


        skills = skills.join(',')
        lock = lock.join(',');

        var url = location.protocol + '//' + location.host + location.pathname + '?skills=' + skills+ '&lock=' + lock;

        if (justReturn) {
            return url;
        } else {
            window.history.pushState('', '魔物基因配置模擬器', '?skills=' + skills+ '&lock=' + lock);
            $('#share-url').val(url);
        }
    }

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
        var bingoLine = {};

        for (var i=1;i<=8;i++) {

            // 先把block的目標整理出來
            var blockInLine = $('.line-' + i);
            var lineBlock = [
                blockInLine.eq(0),
                blockInLine.eq(1),
                blockInLine.eq(2),
            ];

            // 宣告一個稍後用來比對賓果狀況的變數
            var features = {
                'type':{},
                'action':{},
            };
            // 逐一輪掃這一條 bingo 中所需檢驗的格子
            $.each(lineBlock, function(doesntmatter, $eachBlock) {
                var blockType = parseInt($eachBlock.data('type'));
                if (blockType != -1) {
                    features['type'][blockType] = true;
                }

                var blockAction = parseInt($eachBlock.data('action'));
                if (blockAction != -1) {
                    features['action'][blockAction] = true;
                }
            });

            var bingoType;
            if ((bingoType = Object.keys(features['type'])).length==1 && bingoType!=0) {
                type.push(bingoType[0]);
                bingoLine[i] = !!bingoLine[i]?bingoLine[i]:{};
                bingoLine[i]['type'] = bingoType;
            }

            var bingoAction;
            if ((bingoAction = Object.keys(features['action'])).length==1 && bingoAction!=0) {
                action.push(bingoAction[0]);
                bingoLine[i] = !!bingoLine[i]?bingoLine[i]:{};
                bingoLine[i]['action'] = bingoAction;
            }
        }

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

        drawBingoLine(bingoLine, $('#bingo-line-main'));

    };

    /**
     * 畫賓果線
     *
     * @param {*} bingoDatas  exp : {1 : {trye:1, action:2}, 3 : {trye:1, action:3}, .... }
     */
    function drawBingoLine(bingoDatas, $svg) {

        // 清理 svg
        $svg.empty();
        $svg.attr('xmlns',location.protocol + '//' + location.host + location.pathname+'bingoline/svg');

        const LineMap = {
            1: [ [16.5, 16.5], [83.5, 16.5] ],
            2: [ [16.5, 50], [83.5, 50] ],
            3: [ [16.5, 83.5], [83.5, 83.5] ],
            4: [ [16.5, 16.5], [16.5, 83.5] ],
            5: [ [50, 16.5], [50, 83.5] ],
            6: [ [83.5, 16.5], [83.5, 83.5] ],
            7: [ [16.5, 16.5], [83.5, 83.5] ],
            8: [ [83.5, 16.5], [16.5, 83.5] ],
        }

        // 開始畫立賓果線
        $.each(bingoDatas, function(lineID, bingoData) {
            var mapInfo = LineMap[lineID];
            if (!!mapInfo) {
                var posFrom = mapInfo[0];
                var posTo = mapInfo[1];
                $svg.append('<line x1="'+posFrom[0]+'" y1="'+posFrom[1]+'" x2="'+posTo[0]+'" y2="'+posTo[1]+'" class="bingo-line-outer" stroke-linecap="round" stroke-width="3" />');
                if (Object.keys(bingoData).length > 1) {
                    $svg.append('<line x1="'+posFrom[0]+'" y1="'+posFrom[1]+'" x2="'+posTo[0]+'" y2="'+posTo[1]+'" class="bingo-line-inner" stroke-linecap="round" stroke-width="2.5" />');
                    $svg.append('<line x1="'+posFrom[0]+'" y1="'+posFrom[1]+'" x2="'+posTo[0]+'" y2="'+posTo[1]+'" class="bingo-line-inner-inner" stroke-linecap="round" stroke-width="1.25" />');
                }
            }
        });
        $svg.html($svg.html());
    }

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
            html += '<div class="col-12">';
            html += '<button class="btn btn-primary text-left" style="width: calc( 97% - 90px ); margin-right:3%" onclick="loadBingoToBlock(' + k + ');">' + v.name + '</button>';
            html += '<button class="btn btn-secondary" onclick="delBingo(' + k + ');" style="width:70px">刪除</button>'
            html += '</div>';
            html += '</div>';
        });

        if (html.length === 0) {
            html += '<p>目前無紀錄</p>';
        }

        new Dialogify(html, {size: 'sl-dialog', useDialogForm: false}).showModal();
    };

    var loadBingoToBlock = function (id) {
        $('.skill:disabled').each(function () {
            enableSkill($(this).data('id'));
        });

        var bingoData = getBingoData();
        var skills = bingoData[id].skills;

        $.each(skills, function (k, v) {
            var block = $('#block-' + (k+1));
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
            $('#bingo-switch').addClass('link-secondary');
            $('#bingo-switch').removeClass('link-light');
            $('body').removeClass('dark-mode');
        } else {
            Cookies.set('darkMode', 1);
            $('#light-switch').text('開燈');
            $('#light-switch').removeClass('link-secondary');
            $('#light-switch').addClass('link-light');
            $('#bingo-switch').removeClass('link-secondary');
            $('#bingo-switch').addClass('link-light');
            $('body').addClass('dark-mode');
        }
    };

    var toggleBingoLine = function () {
        var disableBingoLine = Cookies.get('disableBingoLine');

        if (disableBingoLine == 1) {
            Cookies.set('disableBingoLine', 0);
            $('#bingo-switch').text('隱藏賓果線');
            $('.bingo-line').removeClass('hide');
        } else {
            Cookies.set('disableBingoLine', 1);
            $('#bingo-switch').text('顯示賓果線');
            $('.bingo-line').addClass('hide');
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
    window.toggleBingoLine = toggleBingoLine;
    window.autoCalc = autoCalc;
    window.calcInfo = calcInfo;
}) (window, jQuery, Cookies);