import { ITextOptions, IRectOptions, Object, SocialButtonAction, SocialButtonShape, IVideoOptions, HtmlElement, Video, IRatingOptions, Youtube } from 'fabric/fabric-impl';
import Animations, { Animation } from '../animations';

declare module 'fabric/fabric-impl' {
    const animations: typeof Animations;
    const settings: any;

    interface IObjectOptions {
        id?: string;
        isAnimationAborted?: boolean;
        showShadow?: boolean;
        title?: string;
        url?: string;
        resourceId?: string;
    }

    interface IImageOptions {
        previewUrl?: string | null;
    }

    interface ITextOptions {
        underline?: boolean;
    }

    interface IInputOptions extends ITextOptions {
        name: string;
    }

    interface IUtilAnimEase {
        linear: IUtilAminEaseFunction;
    }

    interface IVideoOptions extends IRectOptions {
        src: string;
        previewUrl?: string | null;
    }

    interface IFeedbackGroupOptions extends ITextOptions {
        borderWidth: number;
        starSize: number;
        textColor: string;
    }

    interface IRatingOptions extends ITextOptions {
        text: string;
        starDistance: number;
    }

    interface Object {
				resourceName?: string;
				resourceParentId?: string;
        animations: {
            start: Animation | null,
            end: Animation | null,
        };

        getScaledWidth(): number;
        getScaledHeight(): number;
        isNotVisible(): boolean;
        dispose?(): void;
        _setOriginToCenter(): this;
        _resetOrigin(): void;
    }

    interface IAnimationOptions {
        abort?(): boolean;
    }

    interface Canvas {
        findTarget(e: MouseEvent, skipGroup: boolean): Object;
    }

    interface StaticCanvas {
        lowerCanvasEl: HTMLCanvasElement;
        upperCanvasEl: HTMLCanvasElement;
        wrapperEl: HTMLElement;
        width: number;
        height: number;

        startRenderLoop(): void;
        stopRenderLoop(): void;
        attach(object: fabric.Object): void;
        detatch(object: fabric.Object): void;
        initialize(element: HTMLCanvasElement | string, options?: ICanvasOptions): void;
        loadPlayerFromJSON(json: string | any, callback: () => void, reviver?: Function): this;
        _initOptions(options: ICanvasOptions): void;
    }

    class Video extends Object {
        previewUrl: string | null;

        static fromObject(object: any, callback: (video: Video | null, error: boolean) => void);
        static videoFromObject(object: any, callback: (video: Video | null, error: boolean) => void);

        static fromPreview(url: string, callback: (video: Video | null, error: boolean) => void): void;
        static fromVideo(url: string, callback: (video: Video | null, error: boolean) => void): void;

        play(): void;
        stop(): void;
    }

    class FormGroup extends Group { }

    class FeedbackGroup extends FormGroup { }

    class ConnectGroup extends FormGroup {
        connectionProperty: 'simple' | 'phone' | 'email';
    }

    class HtmlElement extends Object {
        fontFamily: string;
        fontWeight: string;
        fontStyle: string;
        fontSize: number;
        textAlign: string;
        lineHeight: number;
        underline: boolean;

        constructor(options: ITextOptions);
        getHostElement(): HTMLElement;
        getCSSTransform(): any;
    }

    class Youtube extends HtmlElement {
        constructor(id: string, options?: IVideoOptions);
        initialize(id: string, options?: IVideoOptions);

        static fromObject(object: any, callback: (youtube: Youtube | null, error: boolean) => void);
        static videoFromObject(object: any, callback: (youtube: Youtube | null, error: boolean) => void);

        play(): void;
        stop(): void;

        static fromPreview(id: string, callback: (youtube: Youtube | null, error: boolean) => void);
        static fromVideo(id: string, callback: (youtube: Youtube | null, error: boolean) => void);
    }

    class FormElement extends HtmlElement {
        formGroup: FormGroup;
    }

    class Button extends FormElement { }

    class ConnectButton extends Button { }

    class VoucherButton extends Button { }

    class FeedbackButton extends Button { }

    class SocialButton extends FormElement {
        action: SocialButtonAction;
        shape: SocialButtonShape;

        constructor(options: ISocialButtonOptions);
    }

    class FacebookButton extends SocialButton { }

    class TwitterButton extends SocialButton { }

    class LinkedinButton extends SocialButton { }

    class Input extends FormElement { }

    class Password extends Input { }

    class Comment extends FormElement { }

    class Rating extends FormElement {
        text: string;
    }

    interface SocialButtonAction {
        accessType: 'login' | 'post' | 'follow' | 'like';
        redirectUrl: string;
        post: {
            page: string,
            text: string,
            image: string,
            imageEnabled: boolean,
        };
        like: {
            page: string,
        };
    }

    type SocialButtonShape = 'square' | 'circle' | 'rectangle';

    interface ISocialButtonOptions extends IRectOptions {
        action?: SocialButtonAction;
        shape?: SocialButtonShape;
    }

    interface IUtilMisc {
        createVideoPromise(src: string): Promise<HTMLVideoElement>;
        createVideo(): HTMLVideoElement;
        generateId(): string;
        insertNodeAfter(newNode: HTMLElement, referenceNode: HTMLElement): void;
        loadYoutubeApi(): Promise<void>;
        isSafari(): boolean;
        parseYoutubeId(url: string): string;
        loadImage(url: string, callback: (image: HTMLImageElement, error?: boolean) => void, context?: any, crossOrigin?: boolean): void;
        loadImagePromise(url: string): Promise<HTMLImageElement>;
        hideElement(element: HTMLElement): void;
        showElement(element: HTMLElement): void;
    }
}
