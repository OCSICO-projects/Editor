import { fabric } from 'fabric';
import { v4 as uuidv4 } from 'uuid';
import animations from './animations';

import './extensions/Object';
import './extensions/Image';

import Canvas from './extensions/Canvas';
import StaticCanvas from './extensions/StaticCanvas';

import Video from './objects/Video';
import Youtube from './objects/Youtube';
import FormGroup from './objects/FormGroup';
import ConnectGroup from './objects/ConnectGroup';
import FeedbackGroup from './objects/FeedbackGroup';
import HtmlElement from './objects/HtmlElement';
import FormElement from './objects/FormElement';
import Button from './objects/Button';
import ConnectButton from './objects/ConnectButton';
import VoucherButton from './objects/VoucherButton';
import FeedbackButton from './objects/FeedbackButton';
import SocialButton from './objects/SocialButton';
import FacebookButton from './objects/FacebookButton';
import TwitterButton from './objects/TwitterButton';
import LinkedinButton from './objects/LinkedinButton';
import Input from './objects/Input';
import Password from './objects/Password';
import Comment from './objects/Comment';
import Rating from './objects/Rating';

export { ICanvasOptions, IVideoOptions, IObjectOptions } from 'fabric/fabric-impl';
export { ConnectionProperty } from './objects/ConnectGroup';

const util = {
    createVideoPromise(src: string): Promise<HTMLVideoElement> {
        const video = document.createElement('video');
        Object.assign(video, { src, autoplay: true, muted: true, playsinline: true });
        video.setAttribute('playsinline', 'true');

        return new Promise((resolve, reject) => {
            let shakerTimeoutId;

            function readyHandler() {
                video.pause();
                video.currentTime = 0;
                clearHandlers();
                resolve(video);
            }

            function clearHandlers() {
                video.oncanplaythrough = video.onerror = video.onplay = undefined;
                clearTimeout(shakerTimeoutId);
            }

            video.oncanplaythrough = () => { readyHandler(); };

            video.onerror = () => {
                const { code, message } = <any>video.error;
                console.error('Error loading video', video.error);
                clearHandlers();

                reject();
            };

            // video.play();

            (function shaker() {
                shakerTimeoutId = setTimeout(() => {
                    if (video.readyState === 4) {
                        readyHandler();
                    } else {
                        shaker();
                    }
                }, 500);
            })();
        });
    },

    createVideo(): HTMLVideoElement {
        const video = document.createElement('video');
        Object.assign(video, { muted: true, loop: true });
        video.setAttribute('playsinline', 'true');
        return video as HTMLVideoElement;
    },

    generateId(): string { return uuidv4(); },

    insertNodeAfter(newNode: HTMLElement, referenceNode: HTMLElement) {
        referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
    },

    parseYoutubeId(url: string): string {
        return url.match(/\/([^\/]*)$/)[1];
    },

    loadYoutubeApi(): Promise<void> {
        return new Promise((resolve, reject) => {
            const youtubeScriptSrc = 'https://www.youtube.com/iframe_api';
            const youtubeScript = document.querySelector(`script[src="${youtubeScriptSrc}"]`);

            if (!youtubeScript) {
                const script = fabric.util.makeElement('script', {
                    src: youtubeScriptSrc,
                    onerror: () => { script.remove(); reject('Error loading Youtube api'); }
                });

                const firstScriptTag = document.querySelector('script');
                firstScriptTag.parentNode.insertBefore(script, firstScriptTag);
            } else if (window.YT && window.YT.loaded) {
                resolve();
                return;
            }

            const readyHandler = window.onYouTubeIframeAPIReady || (() => { });

            window.onYouTubeIframeAPIReady = () => {
                resolve();
                readyHandler();
            };
        });
    },

    isSafari(): boolean {
        return navigator.vendor && navigator.vendor.indexOf('Apple') > -1;
    },

    loadImagePromise(url: string): Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
            fabric.util.loadImage(url, (el: HTMLImageElement, error: boolean) => {
                if (error) { reject(`Error loading image ${url}`); }
                resolve(el);
            });
        });
    },

    hideElement(element: HTMLElement) {
        const displayOriginal = window.getComputedStyle(element).display;

        element.hidden = true;
        element.dataset.displayOriginal = displayOriginal;
        element.style.display = 'none';
    },

    showElement(element: HTMLElement) {
        const displayOriginal = element.dataset.displayOriginal;

        element.hidden = false;
        element.style.display = displayOriginal;

    }
};

const ease = {
    linear: (t, b, c, d) => (c * t / d + b),
};

const settings = Object.freeze({
    resolutions: {
        landscape: {
            width: 1280,
            height: 720,
        },
        portait: {
            width: 852,
            height: 1280,
        }
    },

    actionFacebook: '/connect/facebook?scope=manage_pages,publish_actions',
    actionTwitter: '/connect/twitter',
    actionLinkedin: '/connect/linkedin',
    actionConnect: '/login/connect',
    actionVoucher: '/login/voucher',
    actionFeedback: '/login/feedback',

    version: 1,
});

Object.assign(fabric, { Canvas, StaticCanvas });
Object.assign(fabric, { HtmlElement, FormElement, Button, ConnectButton, SocialButton, FacebookButton, TwitterButton, LinkedinButton });
Object.assign(fabric, { Video, Youtube, FormGroup, ConnectGroup, FeedbackGroup, VoucherButton, FeedbackButton, Input, Password, Comment, Rating });

Object.assign(fabric, { animations, settings });
Object.assign(fabric.util, { ...util });
Object.assign(fabric.util.ease, { ...ease });

export default fabric;
