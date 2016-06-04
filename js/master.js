;!(function($,window,document){
    function Master(){
        this.init();
        // this.ele();  //排序选择的，后台没写完展示不run
    }

    Master.prototype = {
        init: function(){
            function getUrlParam(name) {
                var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
                var r = window.location.search.substr(1).match(reg);
                if (r != null) {
                    return decodeURI(r[2]);
                } else {
                    return null;
                }
            }
            var skillhava = 1; //判断是否有技能
            var comId = getUrlParam("company_id");
            var title = getUrlParam("title");  //得到标题
            document.title = title;
            $.ajax({
                type:"POST",
                url:"/YyWeixin/WeixinWebBkP",
                dataType:"json",
                data:{
                    ServiceName:"CusShowComStaffList",
                    company_id:comId
                },
                success:function(data){
                    console.log(data);
                    var itemEle = "";
                    var itemFun;
                    $.each(data.com_staff,function(index,ele){
                        if(ele.fun_count>1){
                            itemFun = ele.fun_name +"等";
                        }else if(ele.fun_count == 0){
                            itemFun = "";
                        }else{
                            itemFun = ele.fun_name;
                        }
                        itemEle += '<article class="st-article" data-id="'+ele.waiter_id+'" data-img="'+ele.headimgurl+'" data-name="'+ele.waiter_name+'">';
                        itemEle += '<div class="article-logo">';
                        itemEle += '<img src="'+ele.headimgurl+'">';
                        itemEle += '</div>';
                        itemEle += '<div class="article-box">';
                        itemEle += '<div class="content-name">'+ele.waiter_name+'</div>';
                        itemEle += '<div class="content-number">工号：'+ele.staff_id+'</div>';
                        itemEle += '<div class="content-detail">'+itemFun+'</div>';
                        itemEle += '</div>'; 
                        itemEle += '<div class="article-book">预约</div>';
                        itemEle += '</article>';
                    }); 
                    $(".st-content").append(itemEle);
                },
                error:function(){
                    console.log("xhr error");
                }
            });
            $(".st-content").on("click",".st-article",function(){
                var waiterId = $(this).data("id");
                var waiterImg = $(this).data("img");
                var waiterName = $(this).data("name");
                if($(this).find(".content-detail").html().length == 0){
                    skillhava = 0;
                }
                location.href='waiter_block_time.html?company_id='+comId+'&waiter_id='+waiterId+'&waiter_img='+waiterImg+'&waiter_name='+waiterName+'&title='+encodeURI(title)+'&skill='+skillhava+'';
            });
        },
        ele: function(){
            var sh = false;
            $(".js-shop").click(function(){
                change(this,1);
            });

            $(".js-num").click(function(){
                change(this,2);
            });

            $(".js-select").click(function(){
                change(this,3);
            });
            function change(ele,num){
                if($(ele).find("span").hasClass("triangle-top")){
                    $(".js-bg-shadow").hide();
                    $(ele).find("span").removeClass("triangle-top").addClass("triangle-bottom");
                    $(".js-item").addClass("head-item");
                    return false;
                }
                $(".header-item span").removeClass("triangle-top").addClass("triangle-bottom")
                $(ele).find("span").removeClass("triangle-bottom").addClass("triangle-top");
                $(".js-item").addClass("head-item");
                $(".js-bg-shadow").show();
                switch (num){
                    case 1:
                        $(".js-item-shop").removeClass("head-item");
                        break;
                    case 2:
                        $(".js-item-num").removeClass("head-item");
                        break;
                    case 3:
                        $(".js-item-select").removeClass("head-item");
                        break;
                }
            }

            $(".sh-skill").click(function(){
                if(!sh){
                    $(".skill-arrow").css({
                        'transform': 'rotate(90deg)',
                        '-webkit-transform': 'rotate(90deg)'
                    });
                    $(".skill-sum").hide();
                    sh = true;
                }else{
                    $(".skill-arrow").css({
                        'transform': 'rotate(-90deg)',
                        '-webkit-transform': 'rotate(-90deg)'
                    });
                    $(".skill-sum").show();
                    sh = false;
                }
                
            });

        }
    }
    var fun = new Master();
    fun = null;
})(jQuery,window,document);