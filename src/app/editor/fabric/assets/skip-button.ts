export default `
    <div class="player-skip-button" hidden>
        <div class="player-skip-button-text-wrapper">
            <svg class="player-skip-button-text-container" viewBox="0 0 40 20" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                <text class="player-skip-button-text" x="20" y="14" text-anchor="middle">Skip</text>
            </svg>
        </div>
        <style>
            .player-skip-button {
                position: absolute;
                z-index: 1;
                right: 0px;
                cursor: pointer;
                background-color: rgba(0, 0, 0, 0.8);
            }

            .player-skip-button-landscape {
                width: 16%;
            }

            .player-skip-button-portait {
                width: 24%;
            }

            .player-skip-button-text-wrapper {
                position: relative;
                width: 100%;
                padding-bottom: 35%;
                border: 1px solid white;
                border-right: none;
                box-sizing: border-box;
                box-shadow: 0 0 1px 0.5px black;
            }

            .player-skip-button-text-container {
                position: absolute;
                margin-left: 10%;
                width: 80%;
                height: 100%;
            }

            .player-skip-button-text {
                font-family: Arial;
                font-size: 11px;
                font-weight: bold;
                fill: rgba(255, 255, 255, 0.9);
            }
        </style>
    </div>
`;
