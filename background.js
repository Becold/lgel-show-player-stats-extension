const players = [];

window.addEventListener('load',function(){
    if (window.location.href.indexOf('/jeu/index.php?partie=') !== -1) {
        console.log("Players stats viewer loaded");
    
        // Ajout du CSS custom
        var node = document.createElement('style');
        node.innerHTML = `
            .PSV__player-tooltip {
                min-width: 300px;
                color: #fff!important;
                display: -webkit-box;
                display: -ms-flexbox;
                display: flex
            }
        `;
        document.body.appendChild(node);

        
        document.querySelectorAll('span.player').forEach(function(player) {
            let playername = player.textContent.trim();
            if (playername.includes('spectateur') && playername.includes('anonyme'))
                return;

            try {
                player.dataset.playerstatloaded = false;
                player.addEventListener('mouseover', function() {
                    console.log("hovering");
                    if (!(playername in players)) {
                        httpGetAsync('https://www.loups-garous-en-ligne.com/api/profile.php?user=' + playername + '&fields=id,username,level,mdj,state,title,gender,signature,registered,points,playedGames,isPremium,relation,roles,gamesStatistics,achievements,gamesHistory,hamlet,canInviteHamlet,activity,wedding,themes,pantheon,worldCup,character', function(response) {
                            players[playername] = JSON.parse(response);
                            addTooltip(player, players[playername]);
                        });
                    }
                    else if (!player.dataset.playerstatloaded) {
                        addTooltip(player, players[playername]);
                    }
                });

                player.addEventListener('mouseleave', function() {
                    player.dataset.playerstatloaded = false;
                    player.dataset.tooltip = "";
                });
            }
            catch {
                // quiet.
            }
        });
    }
});

function addTooltip(node, player) {
    let gendericon = player.gender === 'female' ? 'https://www.loups-garous-en-ligne.com/jeu/assets/images/girl.png' : 'https://www.loups-garous-en-ligne.com/jeu/assets/images/boy.png';

    let gameinfosinnerhtml;
	if (player.playedGames !== 0) {
        let gamebarinnerhtml = '';
        let pointsPerGame = (player.points / player.playedGames).toFixed(2);
        for (const gamesStats of player.gamesStatistics) {
            const pourcentageGame = (gamesStats.playedGames / player.playedGames * 100).toFixed(0);
            gamebarinnerhtml += `
                <div class="games-bar-section type-${gamesStats.id}" style="flex: ${pourcentageGame}"></div>
            `;
        }

        gameinfosinnerhtml = `
            <p><strong>${player.playedGames}</strong> parties jouées / <strong>${player.points}</strong> points</p>
            <p>(<strong>${pointsPerGame}</strong> points par partie)</p>
            <div class="games-bar">
                ${gamebarinnerhtml}
            </div>
        `;
    }
    else {
        gameinfosinnerhtml = `Ce joueur n'a joué <strong>aucune</strong> partie.`;
    }
    

    node.dataset.tooltip = `
        <div class="PSV__player-tooltip">
            <div class="PSV_profile-infos-user">
                <strong class="username">
                    <img class="msg-icon" src="${gendericon}" />
                    ${player.username}
                </strong>
                <p>Inscrit le ${player.registered}</p>
                <ul class="profile-icons">
                    <li><img src="/static/img/chatelain.png" alt="Premium" /></li>
                    <li><img src="/static/img/profile/level.png" alt="Niveau" />${player.level}</li>
                    <li><img id="gm_commands" src="/static/img/profile/level${player.mdj.level}.svg" alt="Rang MDJ" /></li>
                </ul>
            </div>
            <div class="PSV_profile-infos-games">
                ${gameinfosinnerhtml}
            </div>
        </div>
    `;
    node.dataset.playerstatloaded = true;
}


function httpGetAsync(theUrl, callback) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    }
    xmlHttp.open("GET", theUrl, true);
    xmlHttp.send(null);
}