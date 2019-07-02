let players = [];

var hoverEvt = new MouseEvent('mouseover', {
    view: window,
    bubbles: true,
    cancelable: true,
});

(function() {

    if (window.location.href.indexOf('/jeu/index.php?partie=') !== -1 || 
        window.location.href.indexOf('/jeu/index.php?premier=true') !== -1) {
        console.log("Players stats viewer loaded");
    
        // Ajout du CSS custom
        var node = document.createElement('style');
        node.innerHTML = `
            .PSV__player-tooltip {
                padding: 10px 5px;
                color: #fff!important;
                display: -webkit-box;
                display: -ms-flexbox;
                display: flex
                flex-direction: row;
            }

            .PSV_profile-infos-user {
                flex: 0.25;
            }

            .PSV__username {
                text-shadow: 0 2px 2px rgba(0, 0, 0, .2)
            }

            .PSV__profile-icons {
                display: -webkit-box;
                display: -ms-flexbox;
                display: flex;
                -webkit-box-pack: center;
                -ms-flex-pack: center;
                justify-content: center;
                margin-top: 10px;
                list-style-type: none;
                padding-left: 0;
                font-size: 14px;
                font-weight: 700;
                font-family: Montserrat, sans-serif
            }

            .PSV__profile-icons img {
                display: block;
                width: 32px;
                height: 32px;
                margin: 0 5px;
                margin-bottom: 2px
            }

            .PSV__profile-icons img[disabled] {
                -webkit-filter: brightness(70%) grayscale(1);
                filter: brightness(70%) grayscale(1)
            }

            .PSV__games {
                margin-left: 20px;
            }

            .PSV__games-statistics .PSV__games-played img {
                height: 18px;
                margin-right: 10px;
                vertical-align: -2px;
            }

            .PSV__games-statistics .PSV__games-statistics-wrapper {
                margin: auto;
                position: relative;
                line-height: 25px;
                background-color: rgba(0,0,0,.35);
                text-shadow: 0 2px 2px rgba(0,0,0,.2);
                border-radius: 5px 5px 0 0;
                padding: 5px 10px;
            }

            .PSV__games-bar {
                display: -webkit-box;
                display: -ms-flexbox;
                display: flex;
                height: 5px;
                border-radius: 0 0 3px 3px;
                overflow: hidden
            }

            .PSV__games-bar .PSV__games-bar-section {
                height: 100%
            }

            .PSV__type-0 {
                background-color: #87a254
            }

            .PSV__type-1 {
                background-color: #1d84b1
            }

            .PSV__type-2 {
                background-color: #ef3a3a
            }

            .PSV__type-3 {
                background-color: #a08aa6
            }

            .PSV__type-6 {
                background-color: #653320
            }

            .PSV__type-9 {
                background-color: #919100
            }
        `;
        document.body.appendChild(node);

        document.querySelector('#block_players .block_content').addEventListener('mouseover', (e) => {
            let elHovered = e.target;
			if (!elHovered.classList.contains('list_player')) {
				if (elHovered.classList.contains('player') && elHovered.dataset.playerstatloaded) {
					addTooltip(elHovered, players[playername]);
				} else {
					return;
				}
			}
			elHovered = elHovered.querySelector('.player');
			let playername = elHovered.textContent.trim();
			if (playername.toLowerCase().includes('spectateur') || playername.toLowerCase().includes('anonyme')) return;
			try {
				if (!(playername in players)) {
					httpGetAsync('https://www.loups-garous-en-ligne.com/api/profile.php?user=' + playername + '&fields=id,username,level,mdj,state,title,gender,signature,registered,points,playedGames,isPremium,relation,roles,gamesStatistics,achievements,gamesHistory,hamlet,canInviteHamlet,activity,wedding,themes,pantheon,worldCup,character', function(response) {
						players[playername] = JSON.parse(response);
						addTooltip(elHovered, players[playername]);
					});
				}
				else if (!elHovered.dataset.playerstatloaded) {
					addTooltip(elHovered, players[playername]);
				}
			}
			catch (error) {
				console.log(error);
			}
		});
    }

    
})();

function addTooltip(node, player) {
    let gendericon = player.gender === 'female' ? '/jeu/assets/images/girl.png' : '/jeu/assets/images/boy.png';
    let premiumdisabled = player.isPremium ? "" : "disabled";    

    let gameinfosinnerhtml = "";
    let gamebarinnerhtml = "";
    if (player.playedGames !== 0) {
        let pointsPerGame = (player.points / player.playedGames).toFixed(2);

        gameinfosinnerhtml = `
            <div class="PSV__games-statistics-wrapper">
                <div class="PSV__games-played">
                    <div><img src="/jeu/assets/images/dice.png" alt="Parties"><strong>${player.playedGames}</strong> parties jouées</div>
                    <div><img src="/jeu/assets/images/star.png" alt="Points"><strong>${player.points}</strong> points</div>
                    <div>(<strong>${pointsPerGame}</strong> points par partie)</div>
                </div>
            </div>
        `;

        gamebarinnerhtml = '<div class="PSV__games-bar">';
        for (const gamesStats of player.gamesStatistics) {
            const pourcentageGame = (gamesStats.playedGames / player.playedGames * 100).toFixed(0);
            gamebarinnerhtml += `
                <div class="PSV__games-bar-section PSV__type-${gamesStats.id}" style="flex: ${pourcentageGame}"></div>
            `;
        }
        gamebarinnerhtml += '</div>';
    }
    else {
        gameinfosinnerhtml = `<p>Ce joueur n'a joué <strong>aucune</strong> partie.</p>`;
    }

    node.dataset.tooltip = `
        <div class="PSV__player-tooltip">
            <div class="PSV_profile-infos-user">
                <strong class="PSV__username">
                    <img class="msg-icon" src="${gendericon}" />
                    ${player.username}
                </strong>
                <p>Inscrit le ${player.registered}</p>
                <ul class="PSV__profile-icons">
                    <li><img src="/static/img/chatelain.png" alt="Premium" ${premiumdisabled} /></li>
                    <li><img src="/static/img/profile/level.png" alt="Niveau" />${player.level}</li>
                </ul>
            </div>
			<div class="PSV__games">
                <div class="PSV__games-statistics">
                    ${gameinfosinnerhtml}
                </div>
                ${gamebarinnerhtml}
            </div>
        </div>
    `;
	node.dispatchEvent(hoverEvt);
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