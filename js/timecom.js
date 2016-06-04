/*
*@ 时间段的属性做以下约定
*@ data-attr:
*@           3.过去的时间  4.不可用  5.可点可用但是有可能时间不够  6.可点时间
*@           其中4分为这几种情况：被预约和休息（以后只要是不能被使用的时间都用4）
*@           其中5分为这几种情况：休息前、末尾时间段、被预约前的情况。但是时间是可用的
*/
function Time(nowYMD,time,waiterBook,sectionMin,argEle,serverTime,callback){
    this.time = time;
    this.waiterBook = waiterBook;
    this.sectionMin = sectionMin;
    this.argEle = argEle;
    this.serverTime = serverTime;
    this.nowYMD = nowYMD;
    this.callback = callback;
    this.init();
}
Time.prototype={
    constructor: Time,
    init: function(){
        var _this = this;
        var timeArr = [];
        var waiterArr = []; 
        var cache;
        var timeSection = "";
        var limitCount;
        var getTimeSection = []; //所有工作时间
        var cashArr = []; //不可用的时间
        var serverTimeLen = Math.floor(_this.sectionMin/60)>0 ? ("约"+ Math.floor(_this.sectionMin/60) +"."+ Math.round((_this.sectionMin%60)/60*10) + "小时") : (_this.sectionMin+"分钟");
        if(_this.sectionMin%60 == 0){
            serverTimeLen = "约"+(_this.sectionMin/60)+"小时";
        }
        for(var k = 0; k < _this.time.length; k += 1){
            cache = {};
            for(var j in _this.time[k]){
                cache[j] = _this.time[k][j].replace(/-/g,'/');
            }
            timeArr.push(cache);
            var aa = {};
            aa.start = new Date(cache.work_begin.replace(/-/g,'/')).getTime();
            aa.end = new Date(cache.work_end.replace(/-/g,'/')).getTime();
            getTimeSection.push(aa);
        }

        //-----------计算出不可预约的最后几个数目
        if(_this.serverTime <= _this.sectionMin){
            limitCount = 0;
        }else{
            limitCount = (_this.serverTime % _this.sectionMin == 0) ? (_this.serverTime / _this.sectionMin - 1) : Math.floor(_this.serverTime / _this.sectionMin); 
        }

        //被waiter_book时间
        _this.waiterBook.map(function(ele,index){
            var waiarr = {};
            waiarr.start = new Date(ele.start_time.replace(/-/g,'/')).getTime();
            waiarr.end = new Date(ele.end_time.replace(/-/g,'/')).getTime();
            waiarr.self = ele.self;
            waiterArr.push(waiarr);
            var aa = {};
            aa.start = waiarr.start;
            aa.end = waiarr.end;
            cashArr.push(aa);
            waiarr = null;

        });
        var timeEle = bornTime(timeArr,_this.sectionMin);
        //入口函数，生成时间段
        function bornTime(time,section){
            time.map(function(value,index){
                var aa;
                aa = removeFork(value);  //取整时间
                timeBlock(aa,value,section);
                restTimeCut(value); //取出休息时间段
            });

            var sortCashArr = getAllowTime(cashArr);
            var timeLine = getTimeSection;
            var riverArr = [];

            timeLine.map(function(value,index){
                var newArr = [];  //在此区间的不可用时间
                var pushTimeLock = false; //判断如果有 但是*都是*擦边 比如 [9:30-10:30]交[10:30-20:30] 擦边了10点30分 (这是极其特殊的情况)
                if(sortCashArr.length > 0){
                    sortCashArr.map(function(val,ind){
                        if((val.start<value.start && val.end<value.start) || val.start > value.end){

                        }else{
                            newArr.push(val); //得到在当前时间段的不可用时间
                        }
                    });

                    if(newArr.length>0){
                        newArr.map(function(nn,ii){ 
                            
                            if(newArr[ii-1] && newArr[ii+1]){ //如果不再首尾
                                if(newArr[ii-1].end != newArr[ii].start){
                                    var li = [];
                                    li[0] = newArr[ii-1].end;
                                    li[1] = newArr[ii].start;
                                    riverArr.push(li);
                                    var ol = [];
                                    ol[0] = newArr[ii].end;
                                    ol[1] = newArr[ii+1].start;
                                    riverArr.push(ol);
                                    pushTimeLock = true;
                                }
                            }else{
                                if( typeof(newArr[ii-1]) == 'undefined' && typeof(newArr[ii+1]) == 'undefined' ){ //当只有一个的情况
                                    if(newArr[ii].start > value.start){
                                        var li = [];
                                        li[0] = value.start;
                                        li[1] = newArr[ii].start;
                                        riverArr.push(li);
                                        pushTimeLock = true;
                                    }
                                    if(newArr[ii].end < value.end){
                                        var li = [];
                                        li[0] = newArr[ii].end;
                                        li[1] = value.end;
                                        riverArr.push(li);
                                        pushTimeLock = true;
                                    }
                                }else if(newArr[ii-1]){ //在尾部 
                                    if(newArr[ii].end < value.end){
                                        var li = [];
                                        li[0] = newArr[ii].end;
                                        li[1] = value.end;
                                        riverArr.push(li);
                                        var ol = [];
                                        ol[0] = newArr[ii-1].end;
                                        ol[1] = newArr[ii].start;
                                        riverArr.push(ol);
                                        pushTimeLock = true;
                                    }
                                }else{
                                    if(newArr[ii].start > value.start){
                                        var li = [];
                                        li[0] = value.start;
                                        li[1] = newArr[ii].start;
                                        riverArr.push(li);
                                        pushTimeLock = true;
                                    }
                                }
                            }
                        });
                        if(!pushTimeLock){ //判断如果有 但是*都是*擦边 比如 [9:30-10:30]交[10:30-20:30] 擦边了10点30分 (这是极其特殊的情况)
                            var li = [];
                            li[0] = value.start;
                            li[1] = value.end;
                            riverArr.push(li);
                        }
                    }else{
                        var li = [];
                        li[0] = value.start;
                        li[1] = value.end;
                        riverArr.push(li);
                    }
                }else{
                    var li = [];
                    li[0] = value.start;
                    li[1] = value.end;
                    riverArr.push(li);
                }
            });

            var norepeatArr = [];
            riverArr.map(function(ri){
                var lock = false;
                for(var i=0; i < norepeatArr.length; i+=1){
                    if(ri[0] === norepeatArr[i][0] || ri[0] === norepeatArr[i][1]){
                        lock = true;
                    }
                }
                if(!lock){
                    norepeatArr.push(ri);
                }
            });

            function getAllowTime(arg){
                var timeBox = [];
                for(var i =0,len = arg.length; i < len; i += 1){
                    for(var j = i; j < len; j += 1){
                        if(arg[i].start>arg[j].start){
                            var temp;
                            temp = arg[i];
                            arg[i] = arg[j];
                            arg[j] = temp;
                        }
                    }
                }
                return arg;
            }
            if(_this.callback && typeof(_this.callback) == "function"){
                _this.callback(norepeatArr);
            }
        }
        function restTimeCut(time){
            if(typeof(time.rest_begin) != 'undefined'){  //判断是否有休息时间
                var cache = {};
                cache.start = new Date(time.rest_begin.replace(/-/g,'/')).getTime();
                cache.end = new Date(time.rest_end.replace(/-/g,'/')).getTime();
                cashArr.push(cache);
            }
        }
        //时间取整
        function removeFork(arg){  
            var hour,
                min,
                sec;
            var arr = [],
                temp = 0;
            var returnValue;

            returnValue = newDate(arg.work_begin);
            min = returnValue.getMinutes();
            hour = returnValue.getHours();
            returnValue.setSeconds(0);
            if(min % _this.sectionMin !== 0){
                var rate = Math.floor(min / _this.sectionMin);
                var minSum = 0;
                minSum = hour*60 + _this.sectionMin*(rate+1);
                returnValue.setHours(Math.floor(minSum/60));
                returnValue.setMinutes(minSum%60);
            }
            return returnValue;
        }
        //把一个区段的时间生成块
        function timeBlock(arg,oldTime,timeLen){
            var begin = arg,
                beginStamp = new Date(begin).getTime();
            var lenStamp = timeLen * 60 * 1000;
            //获取当天和当前的各个时间点
            var nowTime = newDate();
            var nowTimeStamp = nowTime.getTime(); //当前时间

            var nowDateTime = newDate(_this.nowYMD.replace(/-/g,"/")+" 00:00:00").getTime();  //选中星期的起点时间
            //当天末尾时间：23:59:59
            var nowLastTime = newDate(_this.nowYMD.replace(/-/g,"/")+" 23:59:59").getTime();
            //如果是当天过去时的时间，截断之
            if(beginStamp < nowDateTime){
                beginStamp = nowDateTime;
            }

            var end = oldTime.work_end,
                endStamp = new Date(end).getTime();
            var i,
                len = Math.floor((endStamp - beginStamp) / lenStamp),
                timeChange,
                hours,
                minute;
            var restStart = oldTime.rest_begin,
                restEnd = oldTime.rest_end;
            var restStartStamp = restStart ? new Date(restStart.replace(/-/g,'/')).getTime() : undefined,
                restEndStamp = restEnd ? new Date(restEnd.replace(/-/g,'/')).getTime() : undefined;
            for(i = 0; i < len; i++){
                if(beginStamp < nowLastTime){
                    timeChange = newDate(beginStamp);
                    hours = timeChange.getHours() >= 10 ? timeChange.getHours() : ("0"+timeChange.getHours());
                    minute = timeChange.getMinutes() >= 10 ? timeChange.getMinutes() : ("0"+timeChange.getMinutes());
                    if(len - limitCount <= i || beginStamp < nowTimeStamp){
                        if(beginStamp < nowTimeStamp){
                            timeSection += '<div class="time-ele limit-choose" data-attr="3"><span class="time-ele-span"><p>'+hours+":"+minute+'</p></span></div>';
                        }else{
                            timeSection += '<div class="time-ele allow-choose" data-attr="5"><span class="time-ele-span"><p>'+hours+":"+minute+'</p></span></div>';
                        }
                    }else{
                        var bool1,
                            bool2,
                            boolRest; //设置此布尔值来判断是否有休息时间
                        if(restStartStamp){//是否是休息时间的走不同的流
                            bool1 = (beginStamp+lenStamp <= restStartStamp);
                            bool2 = (beginStamp >= restEndStamp);
                            boolRest = true;
                        }else{
                            bool1 = true;
                            bool2 = true;
                            boolRest = false;
                        }
                        if(bool1 || bool2){ //休息时间判断
                            var loop = false;
                            var mapLock = true; //map循环当附和条件时不会跳出map循环，加了一个布尔值 当附和map条件时，只执行一遍

                            waiterArr.map(function(value){
                                if(mapLock){
                                    if((beginStamp >= value.start && (beginStamp+1) <= value.end) || (beginStamp < value.start && value.start < beginStamp+_this.sectionMin*60*1000)){   //被waiter约的时间判断
                                        if(value.self === 1){
                                            timeSection += '<div class="time-ele limit-choose get-end-time" data-attr="4"><span class="time-ele-span"><p>'+hours+":"+minute+'</p><p>你已有约</p></span></div>';
                                        }else{
                                            timeSection += '<div class="time-ele limit-choose get-end-time" data-attr="4"><span class="time-ele-span"><p>'+hours+":"+minute+'</p><p>约满</p></span></div>';
                                        }
                                        loop = true;
                                        mapLock = false;
                                    }
                                }

                            });

                            if(boolRest){
                                if(beginStamp + (_this.serverTime*60*1000) > restStartStamp && beginStamp < restStartStamp){ //判断如果休息时间前的时间段小于服务时长
                                    timeSection += '<div class="time-ele allow-choose" data-attr="5"><span class="time-ele-span"><p>'+hours+":"+minute+'</p></span></div>';
                                    loop = true;
                                }
                            }
                            if(!loop){
                                timeSection += '<div class="time-ele allow-choose" data-attr="6"><span class="time-ele-span"><p>'+hours+":"+minute+'</p></span></div>';
                            }
                        }else{
                            timeSection += '<div class="time-ele limit-choose get-end-time" data-attr="4"><span class="time-ele-span"><p>'+hours+":"+minute+'</p><p>休息</p></span></div>';
                        }           
                    }
                    beginStamp += lenStamp;
                }
            }
            document.querySelector(_this.argEle).innerHTML = timeSection;
        }

        function newDate(arg){
            if(arg){
                return new Date(arg);
            }else{
                return new Date();
            }
            
        }
    }
}

