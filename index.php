<?php
require_once('config.php');
?>
<!DOCTYPE html>
<html lang="zh-TW-Hant">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>魔物基因配置模擬器</title>

    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous">
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
    <link href="css/style.css" rel="stylesheet">

    <link href="favicon.ico" rel="shortcut icon" type="image/x-icon">
</head>

<body>
    <div class="container-fluid">
        <div class="row">
            <div class="col-lg-1"></div>
            <div class="col-lg-11">
                <a id="light-switch" href="javascript:;" class="link-secondary" onclick="toggleDarkMode();">關燈</a>
                &emsp;&emsp;
                <a id="bingo-switch" href="javascript:;" class="link-secondary" onclick="toggleBingoLine();">隱藏賓果線</a>
            </div>
        </div>
        <div class="row">
            <div class="col-lg-1"></div>
            <div class="col-12 col-lg-7">
                <div class="row">
                    <div class="col-sm-12 col-lg-8">
                        <div class="padding-table">
                            <svg id="bingo-line"  width="100" height="100" version="1.1" xmlns=""></svg>
                            <div class="row">
                                <div id="block-1" class="col block block-1 line-1 line-4 line-7 align-middle" data-id="0" data-type="0" data-action="0">
                                    <div class="skill-area"><div class="skill-name-block">請先選擇基因</div></div>
                                    <span class="material-icons lock">lock_open</span>
                                    <span class="material-icons clean-block">delete</span>
                                </div>
                                <div id="block-2" class="col block block-2 line-1 line-5 border-left-none" data-id="0" data-type="0" data-action="0">
                                    <div class="skill-area"><div class="skill-name-block">請先選擇基因</div></div>
                                    <span class="material-icons lock">lock_open</span>
                                    <span class="material-icons clean-block">delete</span>
                                </div>
                                <div id="block-3" class="col block block-3 line-1 line-6 line-8 border-left-none" data-id="0" data-type="0" data-action="0">
                                    <div class="skill-area"><div class="skill-name-block">請先選擇基因</div></div>
                                    <span class="material-icons lock">lock_open</span>
                                    <span class="material-icons clean-block">delete</span>
                                </div>
                            </div>
                            <div class="row">
                                <div id="block-4" class="col block block-4 line-2 line-4 border-top-none" data-id="0" data-type="0" data-action="0">
                                    <div class="skill-area"><div class="skill-name-block">請先選擇基因</div></div>
                                    <span class="material-icons lock">lock_open</span>
                                    <span class="material-icons clean-block">delete</span>
                                </div>
                                <div id="block-5" class="col block block-5 line-2 line-5 line-7 line-8 border-top-none border-left-none" data-id="0" data-type="0" data-action="0">
                                    <div class="skill-area"><div class="skill-name-block">請先選擇基因</div></div>
                                    <span class="material-icons lock">lock_open</span>
                                    <span class="material-icons clean-block">delete</span>
                                </div>
                                <div id="block-6" class="col block block-6 line-2 line-6 border-top-none border-left-none" data-id="0" data-type="0" data-action="0">
                                    <div class="skill-area"><div class="skill-name-block">請先選擇基因</div></div>
                                    <span class="material-icons lock">lock_open</span>
                                    <span class="material-icons clean-block">delete</span>
                                </div>
                            </div>
                            <div class="row">
                                <div id="block-7" class="col block block-7 line-3 line-4 line-8 border-top-none" data-id="0" data-type="0" data-action="0">
                                    <div class="skill-area"><div class="skill-name-block">請先選擇基因</div></div>
                                    <span class="material-icons lock">lock_open</span>
                                    <span class="material-icons clean-block">delete</span>
                                </div>
                                <div id="block-8" class="col block block-8 line-3 line-5 border-top-none border-left-none" data-id="0" data-type="0" data-action="0">
                                    <div class="skill-area"><div class="skill-name-block">請先選擇基因</div></div>
                                    <span class="material-icons lock">lock_open</span>
                                    <span class="material-icons clean-block">delete</span>
                                </div>
                                <div id="block-9" class="col block block-9 line-3 line-6 line-7 border-top-none border-left-none" data-id="0" data-type="0" data-action="0">
                                    <div class="skill-area"><div class="skill-name-block">請先選擇基因</div></div>
                                    <span class="material-icons lock">lock_open</span>
                                    <span class="material-icons clean-block">delete</span>
                                </div>
                            </div>
                        </div>
                        <div class="row" style="margin-top: 20px; text-align:center;">
                            <div class="col-4"><button class="btn btn-secondary btn-sl" onclick="clearBingo();">清 空</button></div>
                            <div class="col-4"><button class="btn btn-secondary btn-sl" onclick="saveBingo();">儲 存</button></div>
                            <div class="col-4"><button class="btn btn-secondary btn-sl" onclick="loadBingo();">讀 取</button></div>
                        </div>
                        <div class="row" style="margin-top: 20px; text-align:center">
                            <div class="col-12" style="display:inline-flex">
                                <div style="width:110px;line-height: 2.2em;font-size: 1em; text-align:left">自動排列：</div>
                                <div style="width:calc( ( 100% - 230px ) / 2 ); min-width:calc( ( 85% - 110px ) / 2); padding-right:10px">
                                    <select class="form-control" id="calc-sort-1">
                                        <option value="_sum-">賓果總數最多 優先</option>
                                        <?php
                                        foreach (ACTIONS_LIST as $featureKey => $each) {
                                            if ($featureKey == ACTION_NONE) {
                                                continue;
                                            }
                                            echo "<option value='action-{$featureKey}'>{$each}猜拳 優先</option>";
                                        }
                                        foreach (TYPES_LIST as $featureKey => $each) {
                                            echo "<option value='type-{$featureKey}'>{$each} 優先</option>";
                                        }
                                        ?>
                                    </select>
                                </div>
                                <div style="width:calc( ( 100% - 230px ) / 2 ); min-width:calc( ( 85% - 110px ) / 2); padding-right:10px">
                                    <select class="form-control" id="calc-sort-2">
                                        <option value="_sum-">賓果總數最多 優先</option>
                                        <?php
                                        foreach (ACTIONS_LIST as $featureKey => $each) {
                                            if ($featureKey == ACTION_NONE) {
                                                continue;
                                            }
                                            echo "<option value='action-{$featureKey}'>{$each}猜拳 優先</option>";
                                        }
                                        foreach (TYPES_LIST as $featureKey => $each) {
                                            echo "<option value='type-{$featureKey}'>{$each} 優先</option>";
                                        }
                                        ?>
                                    </select>
                                </div>
                                <button class="btn btn-secondary btn-sl" onclick="autoCalc();" style="width: 120px; max-width: 15%">送出</button>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-12" style="margin-top: 20px; display:inline-flex">
                                <input id="share-url" type="text" class="form-control" style="width:85%; max-width: calc( 100% - 80px );border-top-right-radius: 0px;border-bottom-right-radius: 0px;" readonly>
                                <button class="btn btn-primary" onclick="copyUrl();" style="width:15%; min-width: 80px;border-top-left-radius: 0px;border-bottom-left-radius: 0px;">複製</button>
                            </div>
                        </div>
                        <hr>
                    </div>
                    <div class="col-sm-12 col-lg-4">
                        <div class="row bingo">
                            <div class="col-12">屬性</div>
                            <div class="row content-indent">
                                <?php
                                foreach (TYPES_LIST_SHORT as $eachTypeKey => $eachShortName) {
                                    echo "<div class='col-4 col-lg-12' data-bingo-type='type' data-feature-key='{$eachTypeKey}'>{$eachShortName}：<label class='bingo-value'>100</label>%</div>";
                                }
                                ?>
                            </div>
                            <div class="col-12">
                                <hr>
                            </div>
                            <div class="col-12">猜拳</div>
                            <div class="row content-indent">
                                <?php
                                foreach (ACTIONS_LIST as $eachActionKey => $eachName) {
                                    if ($eachActionKey == ACTION_NONE) {
                                        continue;
                                    }
                                    echo "<div class='col-4 col-lg-12' data-bingo-type='action' data-feature-key='{$eachActionKey}'>{$eachName}：<label class='bingo-value'>100</label>%</div>";
                                }
                                ?>
                            </div>
                            <div class="col-12">
                                <hr>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-12 col-lg-4">
                <div class="row">
                    <div class="col" style="text-indent: -3em;margin-left: 3em;">
                        <span style="width:3em">屬性：</span><?php
                                                            foreach (TYPES_LIST_SHORT as $eachTypeKey => $eachShortName) {
                                                                echo "<button class='btn btn-outline-default type-{$eachTypeKey} filter-btn' data-color='secondary' data-id='{$eachTypeKey}' data-type='type'>$eachShortName</button>";
                                                            }
                                                            ?>
                    </div>
                </div>
                <div class="row" style="margin-top: 10px;">
                    <div class="col" style="text-indent: -3em;margin-left: 3em;">
                        <span style="width:3em">猜拳：</span><?php
                                                            foreach (ACTIONS_LIST as $eachActionKey => $eachName) {
                                                                echo "<button class='btn btn-outline-default action-{$eachActionKey} filter-btn' data-color='secondary' data-id='{$eachActionKey}' data-type='action'>$eachName</button>";
                                                            }
                                                            ?>
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
    <script src="js/js.cookie.min.js"></script>
    <script src="js/dialogify.min.js"></script>
    <script src="js/main.js"></script>
    <script id="skill-info-template" type="text/template">
        <div class="row">
            <div class="col fs-3 info"></div>
        </div>
    </script>
</body>

</html>