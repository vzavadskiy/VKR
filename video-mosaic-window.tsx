import * as React from 'react';
import { FlexWindow } from '@netris/components/flex-windows/flex-window';
import {
    VIDEO_MOSAIC_WINDOW_CLOSE,
    VIDEO_MOSAIC_WINDOW_ID,
} from '../services/video-mosaic-constants';
import { styled } from '../../../containers/styled-components';
import { VideoMosaicList } from './video-mosaic-list/video-mosaic-list';
import { typographySizeMixIn } from '@netris/components/base/typography/typography';
import { VideoMosaicItem, VideoMosaicItemHeader } from './video-mosaic-item/video-mosaic-item';
import {
    useApplicationAction,
    useDispatch,
    useShallowEqualSelector,
} from '../../../containers/redux-application';
import { useCallback, useEffect, useRef, useState } from 'react';
import { videoMosaicWindowSelector } from '../services/video-mosaic-window/video-mosaic-window-selector';
import { VideoMosaicItemPresetToolbar } from './video-mosaic-item/video-mosaic-item-preset-toolbar';
import { FlexBox, Box } from '@netris/components/base/box/box';
import { useFullScreenApi } from '@netris/components/hooks/use-fullscreen';
import { VIDEO_MOSAIC_WINDOW_FULL_SCREEN_TOGGLE__CLICK } from '../services/video-mosaic-window/video-mosaic-window-constants';
import { FullScreenContext } from './video-mosaic-window.helper';

const HEADER_ZONE = 130;

const VideoMosaicWindowOuter = styled(FlexBox)`
    height: 100%;
    ${p => typographySizeMixIn({ theme: p.theme, size: 'small' })};
    background-color: ${p => p.theme.background.primary};
`;

const VideoMosaicOverHeaderWrapper = styled(Box)<{ animationShow: boolean; show: boolean }>`
    position: fixed;
    z-index: 99;
    width: 100%;
    transition: top 0.3s ease-out;
    ${p => {
        return `
            display: ${p.show ? 'block' : 'none'};
            background-color: ${p.theme.background.primary};
            border-bottom: 1px solid ${p.theme.delimiter.color};
            top: ${p.animationShow ? 0 : `-${HEADER_ZONE}px`};
          `;
    }}
`;

const VideoMosaicOverHeader: React.FC<{ animationShow: boolean; handleClose: () => void }> = ({
    animationShow,
    handleClose,
}) => {
    const { fullScreenMode, pinHeader } = useShallowEqualSelector(s => ({
        fullScreenMode: videoMosaicWindowSelector(s).fullScreenMode,
        pinHeader: videoMosaicWindowSelector(s).pinHeader,
    }));
    return (
        <VideoMosaicOverHeaderWrapper
            animationShow={animationShow}
            show={fullScreenMode && !pinHeader}
            onPointerLeave={handleClose}
        >
            <VideoMosaicItemHeader show={true} />
            <VideoMosaicItemPresetToolbar show={true} />
        </VideoMosaicOverHeaderWrapper>
    );
};

const VideoMosaicWindowContent = () => {
    const dispatch = useDispatch();
    const ref = useRef<HTMLDivElement>(null);
    const { toggleFullscreen, isFullscreen } = useFullScreenApi(ref);
    const [showOverHeader, setShowOverHeader] = useState<boolean>(false);
    const handleOpen = useCallback((e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        setShowOverHeader(e.pageY < HEADER_ZONE ? true : false);
    }, []);
    const handleClose = useCallback(() => {
        setShowOverHeader(false);
    }, []);

    useEffect(() => {
        dispatch({
            type: VIDEO_MOSAIC_WINDOW_FULL_SCREEN_TOGGLE__CLICK,
            fullScreenMode: isFullscreen,
        });
    }, [isFullscreen, dispatch]);
    return (
        <FullScreenContext.Provider value={{ toggleFullscreen }}>
            <VideoMosaicWindowOuter ref={ref}>
                <VideoMosaicList />
                <VideoMosaicItem handleOpen={handleOpen} />
                <VideoMosaicOverHeader animationShow={showOverHeader} handleClose={handleClose} />
            </VideoMosaicWindowOuter>
        </FullScreenContext.Provider>
    );
};
export const VideoMosaicWindow = () => {
    const onClose = useApplicationAction({
        type: VIDEO_MOSAIC_WINDOW_CLOSE,
    });
    return (
        <FlexWindow
            id={VIDEO_MOSAIC_WINDOW_ID}
            modal={true}
            size="large"
            initialState={'maximized'}
            height="100%"
            onHideEnd={onClose}
        >
            <VideoMosaicWindowContent />
        </FlexWindow>
    );
};
