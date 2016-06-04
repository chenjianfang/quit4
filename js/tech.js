/*
*@problem:细节略多，当看到有些看不懂的判断时候，那是一些特殊情况的判断
*@函数写法思路：把一个模块放在一个函数里面，比如预约体验券的模块放在fell()函数里面-
* 如果有一些公用的显示，比如服务项目和预约体验券的header都是一样，所以都是调用同一个模块-
* 方法也是一样的，如果有一些公用而且考虑的情况略多有一定的代码量的，防止do repeat 封装了方法
* 如果是不同模块公用的方法，会直接提取到模块的作用域里面
*/
;(function($,window,document,undefined){
    
    function getUrlParam(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) {
            return decodeURI(r[2]);
        } else {
            return null;
        }
    }
    function controlTips(){  //control Pages Tips
        if($(".js-select-ymd").html() == ''){
            $(".js-white-bg").show().find(".small-tips").html("请选择预约开始时间");
            setTimeout(function(){
                $(".js-white-bg").hide();
            },1000);
            return 0;
        }
    }
    var comId = getUrlParam("company_id"); //company_id
    var waiId = getUrlParam("waiter_id");  //waiter_id;
    var title = getUrlParam("title");  //得到标题
    var bokBegin;  //预约开始时间
    var bokEnd;
    var bokItem = [];  //服务项目
    var selectTicketId; //选择的优惠券id 
    var serviceTime=0;
    var returnTimeLine;  //获得的可用时间分段
    //入口函数
    function init(){
        location.hash = 'page0';
        //设置标题
        document.title = title;
        //选择师傅
        $(".js-master-name").click(function(){
            location.href='choose_waiter.html?company_id='+comId+'&title='+encodeURI(title)+'';
        });
        //选择预约开始时间
        $(".js-book-startTime").click(function(){

            if($(".js-master-sle-logo").css("backgroundImage") == "none"){
                $(".js-white-bg").show().find(".small-tips").html("请先选择师傅");
                // $(".js-container-inner").click(function(){
                setTimeout(function(){
                    $(".js-white-bg").hide();
                },1000);
                // });
                return false;
            }

            //清空已选时间
            $(".js-select-ymd").html("");
            $(".js-select-hm").html("");
            $(".js-select-day").html("");
            $(".jf-select-item-sum").html("");
            $(".jf-footer-next").removeClass("ticket-next-click time-next-click footer-next-click").addClass("footer-next-noclick");

            $(".js-popuptime").show();
            //生成时间段(以后生成时间段都可以以下面为模板！！！)
            var dayitem = new DayItem(".dayitemparent"); //生成星期
            dayitem = null;
            var date = new Date();
            var yy = date.getFullYear();
            var mm = (date.getMonth()+1 >= 10) ? (date.getMonth()+1) : ("0"+(date.getMonth()+1));
            var dd = (date.getDate() >= 10) ? date.getDate() : ("0"+date.getDate());
            $.ajax({
                type:"POST",
                url:"/YyWeixin/WeixinWebBkP",
                dataType:"json",
                data:{
                    ServiceName:"CusQueryWaiterSchBookOfDay",
                    waiter_id:waiId,
                    book_date: yy+"-"+mm+"-"+dd
                },
                success:function(data){
                    console.log(data);
                    var time = data.waiter_schedule;  //时间排
                    var waiterBook = data.waiter_book; //已经被预约----新增的参数
                    var nowYMD = yy+"-"+mm+"-"+dd;   //现在的时间
                    var sectionMin = data.book_time;  //时间段的长度，分钟为单位
                    var argEle = ".timeBorn";   //装时间段的容器
                    var serverTime = data.service_time; //服务时长
                    serviceTime = serverTime;  //把服务时长放到外部变量
                    var timecache = new window.Time(nowYMD,time,waiterBook,sectionMin,argEle,serverTime,function(data){
                        returnTimeLine = data;
                        if(data.length == 0){
                            $(".timeBorn").addClass("lookface").html('今天没有排班');
                        }else{
                            $(".timeBorn").removeClass("lookface");
                        }
                    });
                    timecache = null;
                    $(argEle).attr('data-timeLen',data.book_time);
                },
                error:function(){
                    console.log("xhr error");
                }
            });
        });
        //点击选择星期
        $(".dayitemparent").on("click",".dayItem",function(){
            $(".dayItem").removeClass("dayitem-select");
            $(this).addClass("dayitem-select");
            var timeboxHeight = $(".timeBorn").height();
            $(".time-load").css({
                "display":"block",
                "height":timeboxHeight+"px"
            });
            var nowdate = $(this).data("ymd");
            $.ajax({
                type:"POST",
                url:"/YyWeixin/WeixinWebBkP",
                dataType:"json",
                data:{
                    ServiceName:"CusQueryWaiterSchBookOfDay",
                    waiter_id:waiId,
                    book_date: nowdate
                },
                success:function(data){
                    console.log(data);
                    var time = data.waiter_schedule;  //时间排
                    var waiterBook = data.waiter_book; //别的顾客预约----新增的参数
                    var nowYMD = nowdate;   //现在的时间
                    var sectionMin = data.book_time;  //时间段的长度，分钟为单位
                    var argEle = ".timeBorn";   //装时间段的容器
                    var serverTime = data.service_time; //服务时长
                    serviceTime = serverTime; //把服务时长放到外部变量
                    var timecache = new window.Time(nowYMD,time,waiterBook,sectionMin,argEle,serverTime,function(data){
                        returnTimeLine = data;
                        if(data.length == 0){
                            $(".timeBorn").addClass("lookface").html('今天没有排班');
                        }else{
                            $(".timeBorn").removeClass("lookface");
                        }
                        $(".time-load").hide();
                    });
                    timecache = null;
                    $(argEle).attr('data-timeLen',data.book_time);
                },
                error:function(){
                    console.log("xhr error");
                }
            });
        });

        $(".timeBorn").on("click",".allow-choose",function(){
            $(".allow-choose").removeClass("allow-select");
            $(this).addClass("allow-select");
        });

        //选择预约开始时间
        $(".js-bookingcomplete").click(function(){
            $(".js-popuptime").hide();
            if($(".allow-select").length > 0){
                $(".js-select-ymd").html($(".dayitem-select").data("ymd"));
                $(".js-select-hm").html($(".allow-select p:nth-child(1)").html());
                $(".js-select-day").html($(".dayitem-select p:nth-child(1)").html());
                bokBegin = $(".js-select-ymd").html()+" "+$(".js-select-hm").html()+":00"; //计算出开始时间
            }
        });
        $(".js-bookingcancer").click(function(){
            $(".js-popuptime").hide();
        });

        if(waiId != null){
            var waiImg = getUrlParam("waiter_img");
            var waiName = getUrlParam("waiter_name");
            $(".js-master-sle-logo").css('backgroundImage','url('+waiImg+')');
            $(".js-master-sle-name").html(waiName);
        }
        //解决输入框输入法遮挡问题
        var u = navigator.userAgent;
        var isAndroid = u.indexOf('Android') > -1 || u.indexOf('Adr') > -1;
        if(isAndroid){
            var height = $(".main-frame").height() + 150 ;
            $(".js-leave-message-text").focus(function(){
                $(".main-frame").css({
                    "height":height+"px"
                });
                $(".main-footer").css("position","absolute");
                $(".main").scrollTop(150);
            }); 
            $(".js-leave-message-text").blur(function(){
                $(".main-frame").css({
                    "height":height-150+"px"
                });
                $(".main-footer").css("position","fixed");
                $(".main").scrollTop(0);
            }); 
        }
    }
    init();

    //生成星期的方法
    function DayItem(ele){
        this.ele = ele;
        this.init();
    }
    DayItem.prototype={
        init:function(){
            var dayItem = '';
            var dayYMD;
            var dayMD;
            var _serTime;
            for(var i = 0; i < 7; i += 1){
                dayMD = date(i);
                dayItem += '<div class="dayItem" data-YMD="'+dayYMD+'"><p>'+today(i)+'</p><p>'+dayMD+'</p></div>'
            }
            document.querySelector(this.ele).innerHTML = dayItem;
            $(this.ele).find(".dayItem").eq(0).addClass("dayitem-select");
            function date(arg){
                var nowDate = new Date((new Date().getTime())+(arg * 24 * 60 * 60 *1000));
                var year = nowDate.getFullYear();
                var mouth = (nowDate.getMonth() + 1) >= 10 ? (nowDate.getMonth() + 1) : ("0"+(nowDate.getMonth() + 1));
                var day = nowDate.getDate() >= 10 ? nowDate.getDate() : ("0" + nowDate.getDate());
                dayYMD = year + "-" + mouth + "-" + day;
                return mouth + "月" + day + "日";
            }
            function today(arg){
                var weekday = new Array(7);
                weekday = ["星期日","星期一","星期二","星期三","星期四","星期五","星期六"];
                switch (arg){
                    case 0:
                        return "今天";
                        break;
                    case 1:
                        return "明天";
                        break;
                    case 2:
                        return "后天";
                        break;
                    case 3:
                        return weekday[new Date((new Date().getTime())+(arg * 24 * 60 * 60 *1000)).getDay()];
                        break;
                    case 4:
                        return weekday[new Date((new Date().getTime())+(arg * 24 * 60 * 60 *1000)).getDay()];
                        break;
                    case 5:
                        return weekday[new Date((new Date().getTime())+(arg * 24 * 60 * 60 *1000)).getDay()];
                        break;
                    case 6:
                        return weekday[new Date((new Date().getTime())+(arg * 24 * 60 * 60 *1000)).getDay()];
                        break;
                }
            }
        }
    }

    //预约服务项目
    var endTimeFloat;
    function project(){
        var itemPrice = 0,
            itemCount = 0,
            itemtiemLen = 0;
        var itemTimeSum = 0;
        var skillHave = getUrlParam("skill");
        if(skillHave == 0){ //是否有项目
            $(".container-service-type").removeClass("jf-have-color").addClass("jf-nohave-color");
        }
        //项目点击相应的变化
        $(".pj-item-detail").on("click",".pro-click",function(){
            var currEle = $(this);
            if(currEle.find(".pj-ser-box").hasClass("pj-selectitem") == false){
                if(itemCount >= 5){
                    alert("最多可预约5个服务项+_+!");
                    return false;
                }
                currEle.find(".pj-ser-box").addClass("pj-selectitem");
                itemCount += 1;
                itemPrice += (currEle.find(".pj-server-price").html().replace(/元/,"")-0);
                itemtiemLen += (currEle.find(".pj-server-time").html().replace(/分钟/,"")-0);
                $(this).addClass("pro-li-select");
            }else{
                currEle.find(".pj-ser-box").removeClass("pj-selectitem");
                itemCount -= 1;
                itemPrice -= (currEle.find(".pj-server-price").html().replace(/元/,"")-0);
                itemtiemLen -= (currEle.find(".pj-server-time").html().replace(/分钟/,"")-0);
                $(this).removeClass("pro-li-select");
            }
            itemPrice = itemPrice > 0 ? itemPrice : 0;
            if(itemCount > 0){
                $(".pj-numprice span").html(itemPrice);
                $(".pj-footer-right").removeClass("pj-footer-cancer").addClass("pj-footer-sure");
                $(".pj-timelen-num span").html(itemtiemLen);
                $(".pj-item-num span").html(itemCount);
            }else{
                $(".pj-numprice span").html(0);
                $(".pj-footer-right").removeClass("pj-footer-sure").addClass("pj-footer-cancer");
                $(".pj-timelen-num span").html(0);
                $(".pj-item-num span").html(0);
            }
            var timeSum = itemTimeSum - itemtiemLen;
            var liTime = 0;
            $(".pj-head-tips span").html(timeSum);
            $(".pj-item-li").each(function(index,ele){
                var _$ele = $(ele);
                if(_$ele.hasClass("pro-li-select") == false){
                    liTime = $(ele).find(".pj-server-time").html().replace(/分钟/,'');
                    if(liTime > timeSum){
                        $(ele).removeClass('pro-click').addClass('pro-noclick');
                    }else{
                        $(ele).removeClass('pro-noclick').addClass('pro-click');
                    } 
                }

            });
            if(itemCount>0){
                var endStamp = new Date(bokBegin.replace(/-/g,'/')).getTime() + itemtiemLen*60*1000;
                var endhour = new Date(endStamp).getHours();
                var endmin = new Date(endStamp).getMinutes();
                if(endhour < 10){
                    endhour = "0"+endhour;
                }
                if(endmin < 10){
                    endmin = "0"+endmin;
                }
                $(".pj-head-right").html(endhour+":"+endmin);
            }else{
                $(".pj-head-right").html(endTimeFloat);
            }
        });

        //确定选择项目
        $(".pj-sure-select").on("click",".pj-footer-sure",function(){
            bokItem = [];
            $(".jf-select-item-sum").html('共<span>'+itemCount+'</span>个项目');
            $(".jf-footer-next").removeClass("footer-next-noclick ticket-next-click time-next-click").addClass("footer-next-click");
            $(".js-selectitem").hide();
            location.hash = 'page0';
            var endStamp = new Date(bokBegin.replace(/-/g,'/')).getTime() + itemtiemLen*60*1000;
            var endYY = new Date(endStamp).getFullYear();
            var endMM = new Date(endStamp).getMonth() + 1;
            var endDD = new Date(endStamp).getDate();
            var endhour = new Date(endStamp).getHours();
            var endmin = new Date(endStamp).getMinutes();
            if(endMM < 10){
                endMM = "0"+endMM;
            }
            if(endDD < 10){
                endDD = "0"+endDD;
            }
            if(endhour < 10){
                endhour = "0"+endhour;
            }
            if(endmin < 10){
                endmin = "0"+endmin;
            }
            bokEnd = endYY+"-"+endMM+"-"+endDD+" "+endhour+":"+endmin+":00"; //计算结束时间
            $(".pro-li-select").each(function(index,ele){
                var dd = {};
                dd.item_id = $(ele).data("item");
                bokItem.push(dd);
            });
            bokItem = JSON.stringify(bokItem);

        });
        //查看预约详情
        $(".footer-inner").on("click",".footer-next-click",function(){
            getTimeSection()
            var itemEle = "";
            $(".pro-li-select").each(function(index,ele){
                itemEle += '<li class="clearfloat"><span>'+$(ele).find(".pj-server-project").html()+'</span><span>'+$(ele).find(".pj-server-time").html()+'</span><span>¥'+$(ele).find(".pj-server-price").html().replace(/元/g,'')+'</span></li>';
            });
            $(".bookProjectList ul").html(itemEle);
            $(".js-bookProjectNum").html(itemCount+"个");
            $(".js-bookTimeLong").html(itemtiemLen+"分钟");
            $(".js-bookPrice").html("¥"+itemPrice);
            $(".js-booksure-leave").html($(".js-leave-message-text").val().trim());
        });
        //确定预约
        var sureLock = false;
        $(".js-footer-sure").click(function(){
            if(sureLock){
                return false;
            }
            sureLock = true;
            $.ajax({
                type:"POST",
                url:"/YyWeixin/WeixinWebBkP",
                dataType:"json",
                data:{
                    ServiceName: "CustomerAddBook",
                    waiter_id: waiId,
                    book_begin: bokBegin,
                    book_end: bokEnd,
                    remark: $(".leave-message-text input").val().trim(),
                    book_item: bokItem,
                    ticket_id:selectTicketId,
                },
                success:function(data){
                    console.log(data);
                    if(data.errcode == "00000"){
                        location.href="/YyWeixinWeb/customer/new_self_book.jsp";
                    }else{
                        alert(data.errmsg);
                    }
                },
                error:function(){
                    console.log("xhr error");
                }
            });
        });
        //取消预约
        $(".js-book-footer-cancel").click(function(){
            $(".bookProjectSure").hide();
            $(".js-bookTime").nextAll().show();
        });
        $(".jf-footer-cancel").click(function(){
            location.href='/YyWeixinWeb/customer/merchant_discount.html?company_id='+comId+'';
        });
        //预约服务项目
        $(".container-service-type").click(function(){
            if(controlTips() == 0){
                return false;
            };
            if($(this).hasClass("jf-nohave-color")){
                alert("没有服务项目");
                return false;
            }
            document.title="预约服务项目";
            location.hash = 'page1';
            selectTicketId = void(0);  //get到的新写法 值为undefined
            itemPrice = 0;
            itemCount = 0;
            itemtiemLen = 0;
            $(".pj-numprice span").html(0);
            $(".pj-footer-right").removeClass("pj-footer-sure").addClass("pj-footer-cancer");
            $(".pj-timelen-num span").html(0);
            $(".pj-item-num span").html(0);
            $(".js-selectitem").show();
            var returnMin = bookHead();
            itemTimeSum = returnMin;
            var pjt = "";
            $.ajax({
                type:"POST",
                url:"/YyWeixin/WeixinWebBkP",
                dataType:"json",
                data:{
                    ServiceName:"CusGetWaiterItem",
                    waiter_id:waiId
                },
                success:function(data){
                    console.log(data);
                    var noclick = "";
                    if(data.errcode === "00000"){
                        $.each(data.item_array,function(index,ele){
                            if(returnMin >= ele.item_time){
                                noclick = '<li class="pj-item-li pro-click" data-item="'+ele.item_id+'">';
                            }else{
                                noclick = '<li class="pj-item-li pro-noclick" data-item="'+ele.item_id+'">';
                            }
                            pjt += noclick;
                            pjt += '<div class="pj-server-project">'+ele.item_name+'</div>';
                            pjt += '<div class="pj-server-time">'+ele.item_time+'分钟</div>';
                            pjt += '<div class="pj-server-price">'+ele.item_price+'元</div>';
                            pjt += '<div class="pj-server-check">';
                            pjt += '<div class="pj-ser-box"></div>';
                            pjt += '</div></li>';
                        });
                        $(".pj-item-detail ul").html(pjt);
                    }

                },
                error:function(){
                    console.log("xhr error");
                }
            });
        });
    }
    function bookHead(){
        var proymd = $(".js-select-ymd").html();  //得到年月日
        var proStartTime = $(".js-select-hm").html();  //得到时分
        //head信息展示
        $(".pj-head-p").html(proymd);
        $(".pj-head-left").html(proStartTime);

        var reduStart = proymd.replace(/-/g,"/") +" "+ proStartTime+":00";

        var timeLine = returnTimeLine;
        var selectStartTime = new Date(reduStart).getTime(); //选中的开始时间戳
        var getEndTime; //该区段最后可用的时间
        timeLine.map(function(value){
            var aaBool = false,
                bbBool = false;
            value.map(function(val){
                if(val >= selectStartTime){
                    aaBool = true;
                }
                if(val <= selectStartTime){
                    bbBool = true;
                }
            });
            if(aaBool && bbBool){
                if(value[0]>value[1]){
                    getEndTime = value[0];
                }else{
                    getEndTime = value[1];
                }
            }
        });
        var reduGetMin = Math.round((getEndTime-selectStartTime)/1000/60);//获得区间分钟数

        var endTimeDate = new Date(getEndTime);
        var hour = endTimeDate.getHours();
        var min = endTimeDate.getMinutes();
        hour = hour < 10 ? "0"+hour : hour;
        min = min < 10 ? "0"+min : min;
        endTimeFloat = hour+":"+min;
        $(".pj-head-right").html(hour+":"+min);
        $(".pj-head-tips span").html(reduGetMin);  

        return reduGetMin;        
    }
    project();

    //预约体验项目
    function fell(){
        var ticket = [];  //优惠券
        
        var _$this;
        //优惠券信息
        $.ajax({
            type:"POST",
            url:"/YyWeixin/WeixinWebBkP",
            dataType:"json",
            data:{
                ServiceName:"CusGetComUsableTicket",
                company_id: comId
            },
            success:function(data){
                console.log(data);
                if(data.ticket_array.length > 0){
                    $(".container-experience-type").addClass("jf-have-color");
                    $.each(data.ticket_array,function(index,ele){
                        var ticketCell = {};
                        ticketCell.company_name = ele.company_name;
                        ticketCell.ticket_name = ele.ticket_name;
                        ticketCell.deadline = ele.deadline;
                        ticketCell.ticket_id = ele.ticket_id;
                        ticketCell.ticket_time = ele.ticket_time;
                        ticketCell.ticket_type = ele.ticket_type;
                        ticket.push(ticketCell);
                    });
                }else{
                    $(".container-experience-type").addClass("jf-nohave-color");
                }
                console.log(ticket);
            },
            error:function(){
                console.log("xhr error");
            }
        });

        $(".container-experience-type").click(function(){
            if(controlTips() == 0){
                return false;
            };
            if($(this).hasClass("jf-nohave-color")){
                alert("没有体验券");
                return false;
            }
            document.title="选择优惠券";
            location.hash = 'page3';
            $(".bookfeel").show();
            bokItem = []; //清空选的项目
            var returnMin = bookHead();
            var userTicket = "";
            var noUserTicket = "";
            $.each(ticket,function(index,ele){
                var ticketType = ele.ticket_type == 1 ? "体验券" : "试用券";
                var ticketCom = ele.company_name;
                var ticketName = ele.ticket_name;
                var ticketEndUse = ele.deadline.match(/\d+/g);
                var ticketTime = ele.ticket_time;
                var ticketId = ele.ticket_id;

                var ticketEle = "";
                ticketEle += '<li class="bf-ticket-box" data-id="'+ticketId+'">';
                ticketEle += '<div class="bf-ticket-left">'+ticketType+'';
                ticketEle += '<span class="ticke-small-circle cir-l-t"></span><span class="ticke-small-circle cir-l-b"></span><span class="ticke-small-circle cir-r-t"></span><span class="ticke-small-circle cir-r-b"></span></div>';
                ticketEle += '<div class="bf-ticket-center">';
                ticketEle += '<div class="bf-ticket-shopname">'+ticketCom+'</div>';
                ticketEle += '<div class="bf-ticket-name">'+ticketName+'</div>';
                ticketEle += '<div class="bf-ticket-time">使用效期：<span>'+ticketEndUse[0]+'年'+ticketEndUse[1]+'月'+ticketEndUse[2]+'日</span></div>';
                ticketEle += '<span class="ticke-small-circle cir-l-t"></span><span class="ticke-small-circle cir-l-b"></span><span class="ticke-small-circle cir-r-t"></span><span class="ticke-small-circle cir-r-b"></span></div>';
                ticketEle += '<div class="bf-ticket-right">';
                ticketEle += '<p class="ticket-right-timelen"><span>'+ticketTime+'</span>分钟</p>';
                ticketEle += '<p class="ticket-right-use">未使用</p>';
                ticketEle += '<span class="ticke-small-circle cir-l-t"></span><span class="ticke-small-circle cir-l-b"></span>';
                ticketEle += '</div>';
                ticketEle += '</li>';
                if(ticketTime <= returnMin){
                    userTicket += ticketEle;
                }else{
                    noUserTicket += ticketEle;
                }
            });
            if(userTicket.length > 0){
                $(".js-user-ticket ul").html(userTicket);
            }else{
                $(".js-ticket-display-user").hide();
            }
            if(noUserTicket.length > 0){
                $(".js-nouser-ticket ul").html(noUserTicket);
            }else{
                $(".js-ticket-display-nouser").hide();
            }
        });
        //选择体验券
        $(".js-user-ticket").on("click",".bf-ticket-box",function(){
            _$this = $(this);
            location.hash = 'page0';
            console.log(_$this.find(".ticket-right-timelen span").html());
            var endStamp = new Date(bokBegin.replace(/-/g,'/')).getTime() + _$this.find(".ticket-right-timelen span").html()*60*1000;
            var endYY = new Date(endStamp).getFullYear();
            var endMM = new Date(endStamp).getMonth() + 1;
            var endDD = new Date(endStamp).getDate();
            var endhour = new Date(endStamp).getHours();
            var endmin = new Date(endStamp).getMinutes();
            if(endMM < 10){
                endMM = "0"+endMM;
            }
            if(endDD < 10){
                endDD = "0"+endDD;
            }
            if(endhour < 10){
                endhour = "0"+endhour;
            }
            if(endmin < 10){
                endmin = "0"+endmin;
            }
            bokEnd = endYY+"-"+endMM+"-"+endDD+" "+endhour+":"+endmin+":00"; //计算结束时间
            
            selectTicketId = _$this.data('id');
            $(".jf-select-item-sum").html(_$this.find(".bf-ticket-name").html()).css({
                "color":"#ee1f1d"
            });
            $(".jf-footer-next").removeClass("footer-next-noclick footer-next-click time-next-click").addClass("ticket-next-click");
            $(".bookfeel").hide();
        });
        //体验券下一步
        $(".footer-inner").on("click",".ticket-next-click",function(){
            $(".bookProjectSure").show();
            getTimeSection();
            var itemEle = '<li class="clearfloat"><span>'+_$this.find(".bf-ticket-name").html()+'</span><span>'+_$this.find(".ticket-right-timelen span").html()+'分钟</span><span>'+_$this.find(".bf-ticket-left").text().trim()+'</span></li>';
            $(".bookProjectList ul").html(itemEle);
            $(".js-bookProjectNum").html("1个");
            $(".js-bookTimeLong").html(_$this.find(".ticket-right-timelen span").html()+"分钟");
            $(".js-bookPrice").html("¥0");
            $(".js-booksure-leave").html($(".js-leave-message-text").val().trim());
            _$this = null;
        });
    }
    fell();
    /*预约服务时长*/
    function timeLen(){
        var restTime = 0; //剩余时间(分钟单位)
        var selectTimeLen; //选择服务长度
        var reduGetMin; //时间区间的长度
        $(".container-service-time").click(function(){
            if(controlTips() == 0){
                return false;
            };
            document.title="选择服务时长";
            location.hash = 'page2';
            bokItem = [];
            selectTicketId = void(0);
            $(".bsl-box").show();
            var proymd = $(".js-select-ymd").html();  //得到年月日
            var proStartTime = $(".js-select-hm").html();  //得到时分
            var dayByday = $(".dayitem-select p:nth-child(1)").html(); //得到星期几
            var detailDay;
            selectTimeLen = serviceTime;
            if(proStartTime.split(":")[0]-0 < 12){
                detailDay = "上午";
            }else{
                detailDay = "下午";
            }
            //head信息展示
            $(".bsl-header").html(proymd+" "+dayByday+detailDay);
            $(".bsl-time-text-start").html(proStartTime);

            var reduStart = proymd.replace(/-/g,"/") +" "+ proStartTime+":00";
            var timeLine = returnTimeLine;
            var selectStartTime = new Date(reduStart).getTime(); //选中的开始时间戳
            var getEndTime; //该区段最后可用的时间
            timeLine.map(function(value){
                var aaBool = false,
                    bbBool = false;
                value.map(function(val){
                    if(val >= selectStartTime){
                        aaBool = true;
                    }
                    if(val <= selectStartTime){
                        bbBool = true;
                    }
                });
                if(aaBool && bbBool){
                    if(value[0]>value[1]){
                        getEndTime = value[0];
                    }else{
                        getEndTime = value[1];
                    }
                }
            });
            reduGetMin = Math.round((getEndTime-selectStartTime)/1000/60);//获得区间分钟数
            var endTimeDate = new Date(getEndTime);
            var hour = endTimeDate.getHours();
            var min = endTimeDate.getMinutes();
            hour = hour < 10 ? "0"+hour : hour;
            min = min < 10 ? "0"+min : min;

            $(".bsl-head-end-time").html("("+hour+":"+min+")");
            restTime = reduGetMin-serviceTime;

            //如果区间分钟数少于服务时长
            if(reduGetMin < serviceTime){
                $(".tips-over-time").show();
                $(".bsl-foot-right").removeClass("js-bsl-foot-right").addClass("bsl-foot-noclick");
                restTime = 0;
            }else{
                $(".tips-over-time").hide();
                $(".bsl-foot-right").addClass("js-bsl-foot-right").removeClass("bsl-foot-noclick");
            }
            
            $(".bsl-tips span").html(restTime);  
            $(".bsl-time-detail").html(serviceTime+"分钟");
            $(".bsl-foot-left span").html(serviceTime);

            clickImg();
        });
        function clickImg(){
            if(restTime >= serviceTime){
                $(".bsl-plus").removeClass("bsl-plus-noclick").addClass("bsl-plus-click");
            }else{
                $(".bsl-plus").removeClass("bsl-plus-click").addClass("bsl-plus-noclick");
            }
            if(selectTimeLen > serviceTime){
                $(".bsl-reduce").removeClass("bsl-reduce-noclick").addClass("bsl-reduce-click")
            }else{
                $(".bsl-reduce").removeClass("bsl-reduce-click").addClass("bsl-reduce-noclick");
            }
            var endTimeStamp = new Date(bokBegin.replace(/-/g,'/')).getTime() + selectTimeLen*60*1000;
            var returnTime = getEndDate(new Date(endTimeStamp));
            bokEnd = returnTime[0]+"-"+returnTime[1]+"-"+returnTime[2]+" "+returnTime[3]+":"+returnTime[4]+":"+"00";
            var endTime = bokEnd.split(" ")[1].split(":");
            $(".bsl-head-arrive-time").html(endTime[0]+":"+endTime[1]);
        };
        //点击加减时间
        $(".bsl-control-time").on("click",".bsl-plus-click",function(){
            selectTimeLen += serviceTime;
            restTime = reduGetMin - selectTimeLen;
            $(".bsl-time-detail").html(selectTimeLen+"分钟");
            $(".bsl-foot-left span").html(selectTimeLen);
            $(".bsl-tips span").html(restTime);
            clickImg();
        });   
        $(".bsl-control-time").on("click",".bsl-reduce-click",function(){
            selectTimeLen -= serviceTime;
            restTime = reduGetMin - selectTimeLen;
            $(".bsl-time-detail").html(selectTimeLen+"分钟");
            $(".bsl-foot-left span").html(selectTimeLen);
            $(".bsl-tips span").html(restTime);
            clickImg();
        });
        //确定选择时间
        $(".bsl-footer").on("click",".js-bsl-foot-right",function(){
            location.hash = 'page0';
            $(".bsl-box").hide();
            $(".jf-select-item-sum").html('时长<span>'+selectTimeLen+'</span>分钟');
            $(".jf-footer-next").removeClass("footer-next-noclick ticket-next-click footer-next-click").addClass("time-next-click");
        });
        $(".footer-inner").on("click",".time-next-click",function(){
            getTimeSection();
            $(".bookProjectSure").show();
            $(".js-bookTime").nextAll().hide();
            $(".js-book-time-long").show();
            $(".js-booksure-leave").html($(".js-leave-message-text").val().trim());
            $(".js-bookTimeLong").html(selectTimeLen+"分钟");
        });
        //确定预约
        var sureLock = false;
        $(".js-footer-sure").click(function(){
            if(sureLock){
                return false;
            }
            sureLock = true;
            $.ajax({
                type:"POST",
                url:"/YyWeixin/WeixinWebBkP",
                dataType:"json",
                data:{
                    ServiceName: "CustomerAddBook",
                    waiter_id: waiId,
                    book_begin: bokBegin,
                    book_end: bokEnd,
                    remark: $(".leave-message-text input").val().trim(),
                    book_item: bokItem,
                    ticket_id:selectTicketId,
                },
                success:function(data){
                    console.log(data);
                    if(data.errcode == "00000"){
                        location.href="/YyWeixinWeb/customer/new_self_book.jsp";
                    }else{
                        alert(data.errmsg);
                    }
                },
                error:function(){
                    console.log("xhr error");
                }
            });
        });
        //取消预约
        $(".js-book-footer-cancel").click(function(){
            $(".bookProjectSure").hide();
            $(".js-bookTime").nextAll().show();
        });
        $(".jf-footer-cancel").click(function(){
            location.href='/YyWeixinWeb/customer/merchant_discount.html?company_id='+comId+'';
        });
    }
    timeLen();
    function getEndDate(arg){
        var endTime = [];
        var yyEnd = arg.getFullYear();
        var mmEnd = arg.getMonth() + 1;
        var ddEnd = arg.getDate();
        var hhEnd = arg.getHours();
        var miEnd = arg.getMinutes();
        mmEnd = mmEnd < 10 ? ("0"+mmEnd) : mmEnd;
        ddEnd = ddEnd < 10 ? ("0"+ddEnd) : ddEnd;
        hhEnd = hhEnd < 10 ? ("0"+hhEnd) : hhEnd;
        miEnd = miEnd < 10 ? ("0"+miEnd) : miEnd;
        endTime = [yyEnd,mmEnd,ddEnd,hhEnd,miEnd];
        return endTime;
    }

    function getTimeSection(){ //预览显示时间区间，因为有两种情况，跨天和没跨天之分
        $(".bookProjectSure").show();
        var startTime = $(".js-select-ymd").html() + "("+ $(".js-select-day").html() + ") " + $(".js-select-hm").html()+"-";
        var bg = new Date(bokBegin.replace(/-/g,'/'));
        var be = new Date(bokEnd.replace(/-/g,'/'));
        var gds = bg.getDate();
        var gde = be.getDate();
        var endTime;
        if(gds == gde){ //如果是同一天
            var endhour = be.getHours() >= 10 ? be.getHours() : ("0"+be.getHours());
            var endmin = be.getMinutes() >= 10 ? be.getMinutes() : ("0"+be.getMinutes());
            endTime = endhour+":"+endmin;
        }else{
            var weekArr = ["星期日","星期一","星期二","星期三","星期四","星期五","星期六"];
            var week = weekArr[be.getDay()];
            var yy = be.getFullYear();
            var mm = be.getMonth()+1;
            mm = mm>=10 ? mm : ("0"+mm);
            var dd = be.getDate();
            dd = dd>=10 ? dd : ("0"+dd);
            var hh = be.getHours();
            hh = hh>=10 ? hh : ("0"+hh);
            var mi = be.getMinutes();
            mi = mi>=10 ? mi : ("0"+mi);
            endTime = '<br/>'+yy+"-"+mm+"-"+dd+"("+week+") "+hh+":"+mi;
        }
        $(".js-show-time").html(startTime+endTime);
    }

    //路由
    function router(){
        window.onhashchange = function(){
            var hash = location.hash;
            switch (hash){
                case '#page0':
                    $(".bookfeel").hide(); //体验券
                    $(".bsl-box").hide(); //预约服务时长
                    $(".js-selectitem").hide(); //服务项目
                    $(".bookProjectSure").hide();//预览选择
                    document.title = title;
                    break;
            }
        }
    };
    router();


})(jQuery,window,document);