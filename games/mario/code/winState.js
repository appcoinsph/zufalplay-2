/**
	State that's shown when the player wins the game!
	Code by Rob Kleffner, 2011
*/

Mario.WinState = function() {
    this.waitTime = 2;
    this.drawManager = null;
    this.camera = null;
    this.font = null;
    this.kissing = null;
    this.wasKeyDown = false;
};

Mario.WinState.prototype = new Enjine.GameState();

Mario.WinState.prototype.Enter = function() {

    glob_count+=10000;
    $('#gamescore').html('<b>'+glob_count+'</b>');

    var zufals_profit = Math.min(20*(glob_count/5000)*(glob_count/5000),20);
    $('.progress-bar').css('width', zufals_profit*5 +'%').attr('aria-valuenow','');
    $("#zufals_earned").html("<a><b>"+ Math.floor(zufals_profit) +"</b></a>");

    $.ajax(
      {
        url: "../addscore.php",
        dataType: "json",
        type:"POST",
        async: false,

        data:
        {
          mode:'encrypt_score',
          this_score:glob_count,
        },

        success: function(json)
        {
          if(json.status==1)
          {
            encrypted_score = json.msg;
          }
          else
          {
            //console.log('Hi');
          }
        },

        error : function()
        {
          //console.log("something went wrong");
        }
      });

    $.ajax(
      {
        url: "../addscore.php",
        dataType: "json",
        type:"POST",
        async: false,
        
        data:
        {
        mode:'submit_score',
        this_score: glob_count,
        encrypted_score:encrypted_score,
        play_id:document.getElementById('play_id').value,
        game_id:8,
        is_competition:0
        },
        success: function(json)
        {
        if(json.status==1)
        {
          var rank = json.rank;
          var registered_users_count = json.registered_users;
          var game_status = json.game_status;
          var zufals_profit = json.zufals_profit;
          $('#currentscore').html('<b>'+json.msg+'</b>');
          $('#leaderboardstatus').html('<b>'+rank+'</b>'+'/'+registered_users_count);
          $('#zufalsprofit').html('<b>'+zufals_profit+'</b>');
          if(game_status>0)
          {
            location.reload();
          }
        }
        else
        {
          //console.log('Hi');
        }
        },
        error : function()
        {
        //console.log("something went wrong");
        }
      });
    
    this.drawManager = new Enjine.DrawableManager();
    this.camera = new Enjine.Camera();
    
    this.font = Mario.SpriteCuts.CreateBlackFont();
    this.font.Strings[0] = { String: "Thank you for saving me, Mario!", X: 36, Y: 160 };
    
    this.kissing = new Enjine.AnimatedSprite();
    this.kissing.Image = Enjine.Resources.Images["endScene"];
    this.kissing.X = 112;
    this.kissing.Y = 52;
    this.kissing.SetColumnCount(2);
    this.kissing.SetRowCount(1);
    this.kissing.AddNewSequence("loop", 0, 0, 0, 1);
    this.kissing.PlaySequence("loop", true);
    this.kissing.FramesPerSecond = 1/2;
    
    this.waitTime = 2;
    
    this.drawManager.Add(this.font);
    this.drawManager.Add(this.kissing);
};

Mario.WinState.prototype.Exit = function() {
    this.drawManager.Clear();
    delete this.drawManager;
    delete this.camera;
};

Mario.WinState.prototype.Update = function(delta) {
    this.drawManager.Update(delta);
    
    if (this.waitTime > 0) {
        this.waitTime -= delta;
    } else {
        if (Enjine.KeyboardInput.IsKeyDown(Enjine.Keys.S)) {
            this.wasKeyDown = true;
        }
    }
};

Mario.WinState.prototype.Draw = function(context) {
    this.drawManager.Draw(context, this.camera);
};

Mario.WinState.prototype.CheckForChange = function(context) {
    if (this.waitTime <= 0) {
        if (this.wasKeyDown && !Enjine.KeyboardInput.IsKeyDown(Enjine.Keys.S)) {
            context.ChangeState(new Mario.TitleState());
        }
    }
};