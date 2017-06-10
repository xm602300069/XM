/*
 v 1.5
 kelvinObj自制轮播插件
 */

;(function(root,factory){

    if(typeof define === 'function' && define.amd){
        define([],factory);
    }else if(typeof exports === 'object'){
        modules.exports = factory();
    }else{
        root.slide = factory();
    }
})(this,function(){

    var slide = {},

        slideOption ={
            // 宽度
            width:400,
            // 高度
            height:300,
            // 包裹的父元素的样式
            list:'',
            // 子元素Class
            itemClass:'',
            // 是否自动播放
            auto:true,
            // 滑动方向
            direction:'left',
            // 是否超出隐藏
            overflow:true,
            // 间隔时间,
            iTime:2000,
            // 滚动时间
            duration:500,
            // 自定义过渡效果
            transition:'',
            // 悬停是否停止切换（false表示继续切换，true表示停止切换）
            hoverStop:false,
            // 是否需要按钮
            hasBtn:false,
            // 按钮类
            btnClass:'Obj_btn',
            // 按钮父类class
            btnListClass:'Obj_btn_list',
            // 选中类
            activeClass:'active',
            // 是否需要按钮数字
            hasBtnFont: false,
            // 是否需要下一个按钮
            hasNext:false,
            // 是否需要上一个按钮
            hasPrev:false,
            // 下一个按钮样式
            nextClass:'Obj_next',
            // 上一个按钮样式
            prevClass:'Obj_prev',
            // 回调函数（在图片切换的同时进行）
            callback:null,
            // 复制数量（一对为单位、一前一后），只支持向左和向上方向
            copyNum:1,


            // 以下几项无需自定义设置

            // 延迟执行方法对象
            timeobj:null,
            // 切换对象的父对象
            slideList: null,
            // 总宽度
            widthAll : 0,
            // 总高度
            heightAll : 0,
            // 切换个数
            childNum : 0,
            // 当前页码
            pageNum:1,
        },

        // 根据方向配置滑动
        doMove = function(option){
            switch (option.direction){
                case 'left':
                    option.Obj = {
                        attrObj : 'left',//修改的属性/计算长度单位
                        initObj : '-'+(option.width*option.copyNum)+'px',//初始位置
                        pageObj :  function(page){//根据页码移动的公式
                            return Number(-option.width*(page+option.copyNum-1))+'px';
                        },
                    };
                    break;
                case 'right':
                    option.Obj = {
                        attrObj : 'left',
                        initObj : '-'+option.widthAll+'px',
                        pageObj :  function(page){
                            return Number(-(option.widthAll-option.width*(page-1)))+'px';
                        },
                    };
                    break;
                case 'top':
                    option.Obj = {
                        attrObj : 'top',
                        initObj : '-'+(option.height*option.copyNum)+'px',
                        pageObj :  function(page){
                            return Number(-option.height*(page+option.copyNum-1))+'px';
                        },
                    };
                    break;
                case 'bottom':
                    option.Obj = {
                        attrObj : 'top',
                        initObj : '-'+option.heightAll+'px',
                        pageObj :  function(page){
                            return Number(-(option.heightAll-option.height*(page-1)))+'px';
                        },
                    };
                    break;
            }
        },

        // 滑动操作
        execMove = function(option,page){

            var Obj = option.Obj;

            clearTimeout(option.timeobj);
            // 未定义页码，则代表还在当前页
            if(typeof(page) == 'undefined'){
                page = option.pageNum;
            }

            // 如果是当前页就不执行滑动
            if(page != option.pageNum){
                // 切换active类
                itemActive(option,page);
                // 执行滑动
                option.slideList.style[Obj.attrObj] = Obj.pageObj(page);
                // 执行回调
                if(typeof(option.callback) === 'function'){
                    option.callback(option);
                }
            }
            // 判断是否需要重置
            if(page == (option.childNum+1)){
                setTimeout(function(){
                    setTransition(option,false);
                    option.slideList.style[Obj.attrObj] = Obj.initObj;
                    option.pageNum = 1;
                    if(option.hasBtn){
                        changeBtn(option,option.pageNum);
                    }
                },option.duration);
            }else if(page == 0){
                setTimeout(function(){
                    setTransition(option,false);
                    option.slideList.style[Obj.attrObj] = Obj.pageObj(option.childNum);
                    option.pageNum = option.childNum;
                    if(option.hasBtn){
                        changeBtn(option,option.pageNum);
                    }
                },option.duration);
            }else{
                option.pageNum = page;
                if(option.hasBtn){
                    changeBtn(option,page);
                }
            }

            if(option.auto){
                // 自动滚到下一页
                option.timeobj = setTimeout(function(){
                    setTransition(option,true);
                    execMove(option,option.pageNum+1,true);
                },option.iTime);
            }

        },

        // 开启与关闭过渡效果(isOpen : true开，flase关)
        setTransition = function(option,isOpen){
            if(isOpen){
                if(option.transition != ""){
                    option.slideList.style.transition = option.transition;
                }else{
                    option.slideList.style.transition = (option.duration/1000) + 's all ease';
                }
            }else{
                option.slideList.style.transition = 'none';
            }
        },


/*        // 自动切换按钮
        autoChange = function(option){
            var btn;
            var queryStr = '.'+option.btnClass+'.'+option.activeClass;
            var activeObj = option.slideList.parentNode.querySelector(queryStr);
            if(activeObj && activeObj.nextSibling){
                // 切换按钮
                changeBtn(option,activeObj.nextSibling);
            }else{
                // 切换按钮
                changeBtn(option, option.slideList.parentNode.querySelectorAll('.'+option.btnClass)[0]);
            }
        },*/

        // 切换按钮
        changeBtn = function(option,target){
            if(typeof(target) == 'object'){
                //删除当前选中类
                var activeDom = option.slideList.parentNode.querySelector('.'+option.activeClass);
                if(activeDom){
                    activeDom.className = activeDom.className.replace(new RegExp('(^|\\b)' +option.activeClass.split(' ').join('|') + '(\\b|$)', 'gi'), '');
                }
                // 加上点击后的选中类
                target.className += (' '+option.activeClass);

            }else{
                var btn_list = option.slideList.parentNode.querySelectorAll('.'+option.btnClass);
                for(var i in btn_list){
                    if(i < option.childNum){
                        if(btn_list[i].getAttribute('page') == target){
                            btn_list[i].className += (' '+option.activeClass);
                        }else{
                            btn_list[i].className = btn_list[i].className.replace(new RegExp('(^|\\b)'+option.activeClass.split(' ').join('|') + '(\\b|$)', 'gi'), '');
                        }
                    }
                }
            }
        },

        // 子元素active的class切换
        itemActive = function(option,page){

            var children = option.slideList.querySelectorAll('.'+option.itemClass);

            var activeObj = option.slideList.querySelectorAll('.'+option.itemClass+'.active');

            for(var i=0;i<activeObj.length;i++){
                activeObj[i].className = activeObj[i].className.replace(new RegExp('(^|\\b)\\s*'+'active'.split(' ').join('|') + '(\\b|$)', 'gi'), '');
            }

            // 至少有两项才做这个active切换
            if(option.childNum >= 2){
                if(page > option.childNum){
                    page -= option.childNum;
                }else if(page == 0){
                    page = option.childNum;
                }
                var toActiveObj = option.slideList.querySelectorAll('.'+option.itemClass+'[data-page="'+page+'"]');
                for(var i=0;i<toActiveObj.length;i++){
                    toActiveObj[i].className += ' active';
                }
            }else{
                children[option.pageNum].className += ' active';
            }
        },

        // 设置容器元素样式
        styleList = function(option){
            // 设置容器元素样式
            option.slideList.style.position = 'absolute';
            switch (option.direction){
                case 'left':
                    option.slideList.style.top = '0px';
                    option.slideList.style.left = option.Obj.initObj;
                    option.slideList.style.width = option.widthAll+(option.width*(option.copyNum*2))+'px';
                    break;
                case 'right':
                    option.slideList.style.top = '0px';
                    option.slideList.style.left = option.Obj.initObj;
                    option.slideList.style.width = option.widthAll+(option.width*(option.copyNum*2))+'px';
                    break;
                case 'top':
                    option.slideList.style.top = option.Obj.initObj;
                    option.slideList.style.left = '0px';
                    option.slideList.style.width = option.width+'px';
                    break;
                case 'bottom':
                    option.slideList.style.top = option.Obj.initObj;
                    option.slideList.style.left = '0px';
                    option.slideList.style.width = option.width+'px';
                    break;
            }
        },

        // 创建一个包裹父节点
        slideWrap = function(option){
            // 创建一个父元素包裹列表容器
            var container =	document.createElement('div');
            container.innerHTML = option.slideList.outerHTML;

            // 设置父元素样式
            container.style.width = option.width+'px';
            container.style.height = option.height+'px';
            // 是否超出隐藏
            if(option.overflow){
                container.style.overflow = 'hidden';
            }
            container.style.position = 'relative';

            option.slideList.outerHTML = container.outerHTML;

            // 关键的一步,重新获取slideList对象。因为上一步的outerHTML已经让slideList对象变成container了。
            option.slideList = document.querySelector('.'+option.list);
            option.slideList.parentNode.className = option.slideList.className;
            option.slideList.className = '';

        },

        // 计算宽高并设置子元素样式
        caculate = function(option){
            // 计算宽度
            var children = option.slideList.querySelectorAll('.'+option.itemClass);
            var htmlArr = [];
            var realChildArr = [];
            for(var i=0;i<children.length;i++){
                if(i === 0){
                    children[i].className += ' active';
                }
                // 设置子元素样式
                children[i].style.float = option.direction=='right'?'right':'left';
                children[i].style.width = option.width+'px';
                children[i].style.height = option.height+'px';
                children[i].setAttribute("data-page",i+1);
                realChildArr.push(children[i]);
                htmlArr.push(children[i].outerHTML);
            }

            if(option.direction != 'bottom'){
                // 复制第一个属性到最后
                option.slideList.appendChild(realChildArr[0].cloneNode(true));
                // 复制最后一个属性到前面
                option.slideList.insertBefore(realChildArr[realChildArr.length-1].cloneNode(true),realChildArr[0]);

                // 处理需要复制多项的状况
                if(option.copyNum > 1){

                    var itemDom;

                    for(var i=1;i<option.copyNum;i++){
                        option.slideList.appendChild(realChildArr[i].cloneNode(true));
                        itemDom = option.slideList.querySelectorAll('.'+option.itemClass);
                        option.slideList.insertBefore(realChildArr[children.length-1-i].cloneNode(true),itemDom[0]);
                    }
                }
            }else{
                // 加入处理向下滑时，倒序输出
                htmlArr.push(realChildArr[0].outerHTML);
                htmlArr.unshift(realChildArr[realChildArr.length-1].outerHTML);
                option.slideList.innerHTML = htmlArr.reverse().join('');
            }

            // 计算总高度和总宽度
            option.childNum = children.length;
            option.widthAll = option.width * children.length;
            option.heightAll = option.height * children.length;
        },

        // 绑定鼠标悬停停止滑动
        pauseslide = function(option){
            option.slideList.onmouseenter = function(){
                clearTimeout(option.timeobj);
            };
            option.slideList.onmouseleave = function(){
                execMove(option);
            };
        },



        // 按钮拼接与绑定
        btnPrint = function(option){
            var frag = document.createDocumentFragment();
            for(var i=0;i<option.childNum;i++){
                var node = document.createElement('a');
                var text = document.createTextNode(i+1);
                node.setAttribute('page',i+1);
                // 是否需要文字
                if(option.hasBtnFont){
                    node.appendChild(text);
                }
                if(i == 0){
                    node.className = option.btnClass +' '+option.activeClass;
                }else{
                    node.className = option.btnClass;
                }
                frag.appendChild(node);
            }
            var nodeList = document.createElement('div');
            nodeList.className = option.btnListClass;
            nodeList.appendChild(frag);
            option.slideList.parentNode.appendChild(nodeList);

            // 绑定点击事件
            nodeList.onclick = function(e){
                var page;
                if(e.target.nodeName.toLowerCase() == 'a'){
                    page = e.target.getAttribute('page');
                    setTransition(option,true);
                    changeBtn(option,e.target);
                    execMove(option,Number(page));
                }
                e.stopPropagation();
            };
        },

        // 上下页按钮
        nextPrev = function(option,type){
            var node = document.createElement('a');
            if(type == 'prev'){
                node.className = option.prevClass;
                node.onclick = function(){
                    setTransition(option,true);
                    execMove(option,option.pageNum-1);
                };
            }else{
                node.className = option.nextClass;
                node.onclick = function(){
                    setTransition(option,true);
                    execMove(option,option.pageNum+1);
                };
            }
            option.slideList.parentNode.appendChild(node);
        },

        // 处理函数
        deal = function(option){
            // 获取列表容器对象
            option.slideList = document.querySelector('.'+option.list);

            // 计算宽高并设置子元素样式
            caculate(option);

            // 配置滑动
            doMove(option);

            // 设置容器样式
            styleList(option);

            // 创建一个父元素包裹列表容器
            slideWrap(option);

            // 鼠标悬停是否停止轮播
            if(option.hoverStop){
                pauseslide(option);
            }

            // 判断是否需要切换按钮
            if(option.hasBtn){
                btnPrint(option);
            }

            // 判断是否要下一页切换按钮
            if(option.hasNext){
                nextPrev(option,'next');
            }

            // 判断是否需要上一页切换按钮
            if(option.hasPrev){
                nextPrev(option,'prev');
            }

            // 判断是否需要touch事件
            if(option.isPhone && option.isTouch){
                touchslide(option);
            }

            // 执行滑动
            execMove(option,1,true);
        };

    // 初始化
    slide.init = function(options){
        var _option = {};

        // 复制配置变量（不能使用_option = slideOption）
        for(var name in slideOption){
            _option[name] = slideOption[name];
        }

        // 覆盖配置
        for(var name in options){
            _option[name] = options[name];
        }

        // 处理函数
        deal(_option);
        // 返回处理后的配置
        return _option;

    };
    // 下一页
    slide.next = function(option){
        setTransition(option,true);
        execMove(option,option.pageNum+1);
    };
    // 上一页
    slide.prev = function(option){
        setTransition(option,true);
        execMove(option,option.pageNum-1);
    };

    slide.execMove = execMove;
    slide.setTransition = setTransition;

    return slide;

});