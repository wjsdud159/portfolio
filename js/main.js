$(document).ready(function(){
    $('.open_btn').on('click', function (e) {
        e.preventDefault();
        var $openBtn = $(this);   //닫기버튼 클릭시 열어준 버튼으로 포커스 강제 이동
        var $mdCnt = $( $openBtn.attr('href') ); //#modal1, #modal2 문자타입이 아니라 선택자
        console.log($mdCnt, typeof $mdCnt);
        var $closeBtn = $mdCnt.find('.close_btn');  //닫기 버튼
        var $first = $mdCnt.find('[data-link="first"]');    //처음 포커스가 이동할 대상
        var $last = $mdCnt.find('[data-link="last"]');      //마지막 포커스가 이동할 대상
        var timer = 0;    //resize 이벤트의 성능을 향상 시키기 
        
        /* 
        1) 스크린리더에서는 열려진 모달 말고는 접근하지 못하도록 제어
        aria-hidden="true" inert(비활성, 불활성)
        2) #dim 동적 생성
        3) resize 이벤트로 열려질 모달의 위치 제어
        4) #dim, 모달 컨텐츠를 보여지게 처리, 첫번째 링크에 포커스 강제 이동

        접근성을 위해 추가 : 닫기 버튼을 누르기 전까지 포커스는 모달 내부에 존재해야 함
        첫번째 링크에서 shift+tab을 누르면 가장 마지막으로 포커스 강제이동
        마지막 링크에서 shift(X)+tab을 누르면 가장 처음으로 포커스 강제이동
        */

        $('html').addClass('md_open');

        //1) 스크린리더에서는 열려진 모달 말고는 접근하지 못하도록 제어
        $mdCnt.siblings().attr({'aria-hidden': true, inert: ''});

        //2) #dim 동적 생성
        $mdCnt.before('<div id="dim"></div>');
        var $dim = $('#dim'); //동적 생성이 완료된 후에 변수에 저장

        //3) resize 이벤트로 열려질 모달의 위치 제어
        $(window).on('resize', function () {
        clearTimeout(timer);

        timer = setTimeout(function () {
            var y = ( $(window).height() - $mdCnt.outerHeight() ) / 2;
            var x = ( $(window).width() - $mdCnt.outerWidth() ) / 2;
            //console.log(x, y)
            $mdCnt.css({top: y, left: x});
        }, 100);
        });
        $(window).trigger('resize');

        //4) #dim(display), 모달 컨텐츠(visibility)를 보여지게 처리, 첫번째 링크에 포커스 강제 이동
        $dim.stop().fadeIn().next().css('visibility', 'visible');
        $first.focus();

        //첫번째 링크에서 shift+tab을 누르면 가장 마지막으로 포커스 강제이동
        $first.on('keydown', function (e) {
        //console.log(e.keyCode); //tab - 9
        if (e.shiftKey && e.keyCode == 9) {
            e.preventDefault();   //기본 기능을 먼저 제한
            $last.focus();
        }
        });

        //마지막 링크에서 shift(X)+tab을 누르면 가장 처음으로 포커스 강제이동
        $last.on('keydown', function (e) {
        if (!e.shiftKey && e.keyCode == 9) {
            e.preventDefault();
            $first.focus();
        }
        });

        //닫기버튼 클릭 : $dim 투명도 0으로 사라지기(완료함수로 remove()로 제거), 모달컨텐츠 숨기기(visibility),  모달상세컨텐츠의 나머지 형제들을 스크린리더에서 접근할수 있도록 되돌리기(aria-hidden, inert), 열기 버튼으로 포커스 강제 이동
        $closeBtn.on('click', function () {
        $dim.stop().fadeOut('fast', function () {
            $(this).remove();
        });
        $mdCnt.css('visibility', 'hidden').siblings().removeAttr('aria-hidden inert');
        $openBtn.focus();
        $('html').removeClass('md_open');
        $('html, body').stop().animate({scrollTop: $(document).height() - $(window).height()}, 200);
        });

        //마스크 영역을 클릭해도 모달 컨텐츠 닫기기
        $dim.on('click', function () {
        $closeBtn.click();
        });

        //Esc 키를 누르면 모달 컨텐츠 닫기기
        $(window).on('keydown', function (e) {
        //console.log(e.keyCode);   //27
        //esc키를 누르는 조건을 만족하는 동안만 닫기버튼을 강제 클릭
        if (e.keyCode == 27) $closeBtn.click();
        });
    }); //click

    //1) 로딩이 완료된후 초기화면 설정
    $('.tab:first-of-type, .tabpanel:first-of-type').addClass('active').attr('tabIndex', 0);
    $('.tab:first-of-type').attr('aria-selected', true);
    $('.tabpanel:first-of-type').attr('aria-hidden', false);
  
    /* 2) 탭버튼에서 키보드를 누르는 이벤트(keydown) - 키보드 제어*/
    $('.tab').on('keydown', function (e) {
      var key = e.keyCode;
      console.log(key); //왼쪽방향키 37 , 오른쪽 방향키 39, 스페이스바 32 , 엔터 13
      switch (key) {
        case 37:    //왼쪽 방향키
          $(this).attr('tabIndex', -1);
          if ($(this).hasClass('first')) $(this).siblings('.last').attr('tabIndex', 0).focus();
          else $(this).prev().attr('tabIndex', 0).focus();
          break;
        case 39:  //오른쪽 방향키
          $(this) .attr('tabIndex', -1);
          if ($(this).hasClass('last')) $(this).siblings('.first').attr('tabIndex', 0).focus();
          else $(this).next().attr('tabIndex', 0).focus();
          break;
        case 36:  //HOME 키는 가장 처음으로
          e.preventDefault();
          $(this).siblings('.first').attr('tabIndex', 0).focus();
          break;
        case 35:  //END 키는 가장 마지막으로
          e.preventDefault();
          $(this).siblings('.last').attr('tabIndex', 0).focus();
          break;
        case 32:  //스페이스바
        case 13:  //엔터
          var $tg = $(this);
          activeOn($tg);
          break;
      }
    });
  
    //3) 탭 클릭 이벤트
    $('.tab').on('click', function () {
      var $tg = $(this);
      activeOn($tg);
    });
  
    function activeOn($target) {
      $target.addClass('active').attr({'aria-selected': true, tabIndex: 0}).siblings().removeClass('active').attr({'aria-selected': false, tabIndex: -1});
      $('#' + $target.attr('aria-controls')).addClass('active').attr({'aria-hidden': false, tabIndex: 0}).siblings('.tabpanel').removeClass('active').attr({'aria-hidden': true, tabIndex: -1});
    }
});

