export default `
    <div class="player-error-box" style="display: none;">
        <div class="player-error-text">Error loading resources. Try to refresh the page</div>
        <style>
            .player-error-box {
                position: absolute;
                display: flex;
                align-items: center;
                justify-content: center;
                background-color: black;
                width: 100%;
                height: 100%;
                z-index: 2;
            }

            .player-error-text {
                text-align: center;
                font-size: 28px;
                color: white;
            }
        </style>
    </div>
`;
