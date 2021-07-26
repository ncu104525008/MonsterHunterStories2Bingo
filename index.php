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
    <div class="container-fluid" style="margin-top: 50px;">
        <div class="row">
            <div class="col-lg-1"></div>
            <div class="col-12 col-lg-4">
                <div class="row">
                    <div class="col block block-1 line-1 line-4 line-7 align-middle" data-id="0" data-type="0" data-attr="0"><div>請先選擇基因</div></div>
                    <div class="col block block-2 line-1 line-5 border-left-none" data-id="0" data-type="0" data-attr="0"><div>請先選擇基因</div></div>
                    <div class="col block block-3 line-1 line-6 line-8 border-left-none" data-id="0" data-type="0" data-attr="0"><div>請先選擇基因</div></div>
                </div>
                <div class="row">
                    <div class="col block block-4 line-2 line-4 border-top-none" data-id="0" data-type="0" data-attr="0"><div>請先選擇基因</div></div>
                    <div class="col block block-5 line-2 line-5 line-7 line-8 border-top-none border-left-none" data-id="0" data-type="0" data-attr="0"><div>請先選擇基因</div></div>
                    <div class="col block block-6 line-2 line-6 border-top-none border-left-none" data-id="0" data-type="0" data-attr="0"><div>請先選擇基因</div></div>
                </div>
                <div class="row">
                    <div class="col block block-7 line-3 line-4 line-8 border-top-none" data-id="0" data-type="0" data-attr="0"><div>請先選擇基因</div></div>
                    <div class="col block block-8 line-3 line-5 border-top-none border-left-none" data-id="0" data-type="0" data-attr="0"><div>請先選擇基因</div></div>
                    <div class="col block block-9 line-3 line-6 line-7 border-top-none border-left-none" data-id="0" data-type="0" data-attr="0"><div>請先選擇基因</div></div>
                </div>
                <div class="row" style="margin-top: 20px;">
                    <div class="col"><button class="btn btn-secondary" onclick="clearBingo();">清空</button></div>
                    <div class="col"><button class="btn btn-secondary" onclick="saveBingo();">儲存</button></div>
                    <div class="col"><button class="btn btn-secondary" onclick="loadBingo();">讀取</button></div>
                </div>
                <div class="row" style="margin-top: 20px;">
                    <div class="col-10">
                        <input id="share-url" type="text" class="form-control" readonly>
                    </div>
                    <div class="col-2">
                        <button class="btn btn-primary" onclick="copyUrl();">複製</button>
                    </div>
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
    <script src="js/main.js"></script>
    <script id="skill-info-template" type="text/template">
        <div class="row">
            <div class="col fs-3 info"></div>
        </div>
    </script>
</body>
</html>
