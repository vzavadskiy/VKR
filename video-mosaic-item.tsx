import * as React from 'react';
import { Box, FlexBox } from '@netris/components/base/box/box';
import { styled } from '../../../../containers/styled-components';
import { Button } from '@netris/components/base/button/button';
import {
    List,
    Save,
    X as CloseIcon,
    Share2,
    Maximize2,
    Minimize2,
    Pin,
    PinOff,
} from '@netris/netris-icons';
import { t } from '../../../../locale';
import { InputGroup } from '@netris/components/inputs/containers/input-group';
import { TextInput } from '@netris/components/inputs/text-input/text-input';
import { Text } from '../../../../components/react/ui/typography';
import { LogoEchdIcon } from '../../../../components/react/widgets-echd2/logo';
import { useSystemSetting } from '../../../../containers/application-utils-react';
import {
    useApplicationAction,
    useShallowEqualSelector,
} from '../../../../containers/redux-application';
import { VIDEO_MOSAIC_WINDOW_ID } from '../../services/video-mosaic-constants';
import {
    videoMosaicItemPresetSelector,
    videoMosaicItemPresetShareModeByUserSelector,
} from '../../services/video-mosaic-item/video-mosaic-item-selector';
import { VideoMosaicItemPreset } from './video-mosaic-item-preset';
import {
    VIDEO_MOSAIC_ITEM_PRESET__SAVE_BTN_CLICK,
    VIDEO_MOSAIC_PRESET_FORM_ID,
} from '../../services/video-mosaic-item/video-mosaic-item-constants';
import { useForm, useFormFieldValue } from '../../../../services/forms/forms-hooks';
import { ElementWithDotWrapper } from '@netris/components/base/dot/dot';
import { videoMosaicWindowSelector } from '../../services/video-mosaic-window/video-mosaic-window-selector';
import {
    VIDEO_MOSAIC_WINDOW_PIN_HEADER_TOGGLE__CLICK,
    VIDEO_MOSAIC_WINDOW_PRESETS_LIST_TOGGLE__CLICK,
} from '../../services/video-mosaic-window/video-mosaic-window-constants';
import type { IApplicationState } from '../../../../containers/application-state';
import { FLEX_WINDOWS_HIDE_WINDOW } from '@netris/components/services/flex-windows/flex-windows-constants';
import { FullScreenContext } from '../video-mosaic-window.helper';
import { useCallback, useContext, useEffect, useState } from 'react';
import { useOpenShareWindow } from './video-mosaic-item-preset-helper';
import { VIDEO_MOSAIC_SHARE_MODE_VIEW } from '../../services/video-mosaic-share/video-mosaic-share-constants';
import { videoMosaicCellsFilterIsCustomSelector } from '../../services/video-mosaic-cells/video-mosaic-cells-selector';
import { videoMosaicListItemsSelectedItemIdSelector } from '../../services/video-mosaic-list/video-mosaic-list-selector';
import { videoMosaicPresetSchema } from '../../services/video-mosaic-item/video-mosaic-item-helper';

const VideoMosaicItemOuter = styled(FlexBox)`
    flex-direction: column;
    flex: 1;
`;

const VideoMosaicItemPresetHeaderOuter = styled(FlexBox)<{ show: boolean }>`
    position: relative;
    border-left: 1px solid ${p => p.theme.delimiter.color};
    ${p => {
        return `
            display: ${p.show ? 'flex' : 'none'};
            align-items: center;
            justify-content: space-between;
            border-bottom: 1px solid ${p.theme.delimiter.color};
        `;
    }}
`;

const VideoMosaicItemPresetHeaderTitle = styled(FlexBox)`
    align-items: center;
    justify-content: center;
    position: absolute;
    width: 100%;
`;

const FlexBoxWrapper = styled(FlexBox)`
    position: relative;
`;

const selectVideoMosaicItemHeader = (s: IApplicationState) => {
    const shareMode = videoMosaicItemPresetShareModeByUserSelector(s);
    return {
        preset: videoMosaicItemPresetSelector(s),
        fullScreenMode: videoMosaicWindowSelector(s).fullScreenMode,
        pinHeader: videoMosaicWindowSelector(s).pinHeader,
        listOpen: videoMosaicWindowSelector(s).presetsListOpen,
        canEdit: shareMode !== VIDEO_MOSAIC_SHARE_MODE_VIEW,
        isCustomFilter: videoMosaicCellsFilterIsCustomSelector(s),
        selectedItemId: videoMosaicListItemsSelectedItemIdSelector(s),
    };
};

export const VideoMosaicItemHeader: React.FC<{ show: boolean }> = ({ show }) => {
    const { changedFields, getInputProps, isValid, validate } = useForm(
        VIDEO_MOSAIC_PRESET_FORM_ID,
        {
            dependency: 1,
            schema: videoMosaicPresetSchema,
        }
    );
    const { errors, ...nameProps } = getInputProps('name', 'text');
    const fullScreenCtx = useContext(FullScreenContext);
    const ctxToggleFullscreen = fullScreenCtx?.toggleFullscreen;
    const CUSTOMER_NAME = useSystemSetting('CUSTOMER_NAME');
    const {
        preset,
        fullScreenMode,
        pinHeader,
        listOpen,
        canEdit,
        isCustomFilter,
        selectedItemId,
    } = useShallowEqualSelector(selectVideoMosaicItemHeader);
    const onClose = useApplicationAction({
        type: FLEX_WINDOWS_HIDE_WINDOW,
        windowId: VIDEO_MOSAIC_WINDOW_ID,
    });
    const onFullScreen = useCallback(() => {
        ctxToggleFullscreen?.();
    }, [ctxToggleFullscreen]);
    const {
        onChange: onScreenRotationEnabledChange,
        checked: screenRotationEnabledValue,
    } = useFormFieldValue(VIDEO_MOSAIC_PRESET_FORM_ID, 'screenRotationEnabled', 'checkbox');
    const [isRotationBeforeFullScreen, setIsRotationBeforeFullScreen] = useState<boolean>(
        !!screenRotationEnabledValue
    );
    const onScreenRotationStopped = useCallback(() => {
        if (document.fullscreenElement) {
            setIsRotationBeforeFullScreen(screenRotationEnabledValue as boolean);
            onScreenRotationEnabledChange?.(false);
        } else if (isRotationBeforeFullScreen) {
            onScreenRotationEnabledChange?.(true);
        }
    }, [isRotationBeforeFullScreen, onScreenRotationEnabledChange, screenRotationEnabledValue]);
    useEffect(() => {
        document.addEventListener('fullscreenchange', onScreenRotationStopped);
        return () => {
            document.removeEventListener('fullscreenchange', onScreenRotationStopped);
        };
    }, [onScreenRotationStopped]);
    const onPinHeaderToggle = useApplicationAction({
        type: VIDEO_MOSAIC_WINDOW_PIN_HEADER_TOGGLE__CLICK,
    });
    const onListToggle = useApplicationAction({
        type: VIDEO_MOSAIC_WINDOW_PRESETS_LIST_TOGGLE__CLICK,
    });
    const onSave = validate({
        type: VIDEO_MOSAIC_ITEM_PRESET__SAVE_BTN_CLICK,
        id: preset.id,
    });
    const onShareClick = useOpenShareWindow(preset.name, preset.id as string);
    const pinBtn = fullScreenMode ? (
        <Button
            icon={pinHeader ? Pin : PinOff}
            onClick={onPinHeaderToggle}
            trainingIdentifier="video-mosaic-item__pin-btn"
            mr={2}
            tooltipText={t(pinHeader ? 'video-mosaic.header.pin-off' : 'video-mosaic.header.pin')}
        />
    ) : null;
    const btnSaveEnable =
        selectedItemId && preset.name && isValid && (isCustomFilter || changedFields.length);
    const hasChanges = changedFields.length > 0 || isCustomFilter;
    return (
        <VideoMosaicItemPresetHeaderOuter show={show} p={2}>
            <VideoMosaicItemPresetHeaderTitle>
                <LogoEchdIcon width={33} height={28} />
                <Box pl={1} pr={3}>
                    <Text size="large">{CUSTOMER_NAME}</Text>
                </Box>
                <Text size="large">{t('video-mosaic.title')}</Text>
            </VideoMosaicItemPresetHeaderTitle>

            <FlexBoxWrapper>
                <Button
                    tooltipText={t('video-mosaic.list')}
                    mr={2}
                    icon={List}
                    toggled={listOpen}
                    buttonType="primary"
                    onClick={onListToggle}
                    trainingIdentifier="video-mosaic-item__video-mosaic-list"
                />
                {selectedItemId && (
                    <FlexBox>
                        <InputGroup withoutDelimiter={true} mr={2}>
                            <TextInput
                                maxWidth={210}
                                mb={0}
                                placeholder={t('video-mosaic.item.name')}
                                {...nameProps}
                                trainingIdentifier="video-mosaic-item__item-name"
                            />
                            <ElementWithDotWrapper dotShow={hasChanges} dotColor="active">
                                <Button
                                    buttonType="primary"
                                    tooltipText={t('js.button.save')}
                                    icon={Save}
                                    onClick={onSave}
                                    trainingIdentifier="video-mosaic-item__on-save"
                                    disabled={!btnSaveEnable}
                                />
                            </ElementWithDotWrapper>
                        </InputGroup>
                        {canEdit && (
                            <Button
                                buttonType="primary"
                                tooltipText={t('video-mosaic.item.action.share')}
                                mr={2}
                                icon={Share2}
                                onClick={onShareClick}
                                trainingIdentifier="video-mosaic-item__action-share"
                            />
                        )}
                    </FlexBox>
                )}
            </FlexBoxWrapper>
            <FlexBoxWrapper>
                {pinBtn}
                <Button
                    icon={fullScreenMode ? Minimize2 : Maximize2}
                    onClick={onFullScreen}
                    trainingIdentifier="video-mosaic-item__maximize2"
                    mr={2}
                    tooltipText={t(
                        fullScreenMode
                            ? 'video-mosaic.header.fullscreen.off'
                            : 'video-mosaic.header.fullscreen.on'
                    )}
                />
                <Button
                    buttonType="transparentBackground"
                    icon={CloseIcon}
                    onClick={onClose}
                    trainingIdentifier="video-mosaic-item__close"
                    tooltipKey="js.button.close"
                />
            </FlexBoxWrapper>
        </VideoMosaicItemPresetHeaderOuter>
    );
};

const VideoMosaicItemComponent: React.FC<{
    handleOpen: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}> = ({ handleOpen }) => {
    const { fullScreenMode, pinHeader } = useShallowEqualSelector(s => ({
        fullScreenMode: videoMosaicWindowSelector(s).fullScreenMode,
        pinHeader: videoMosaicWindowSelector(s).pinHeader,
    }));
    return (
        <VideoMosaicItemOuter>
            <VideoMosaicItemHeader show={!fullScreenMode || pinHeader} />
            <VideoMosaicItemPreset handleOpen={handleOpen} />
        </VideoMosaicItemOuter>
    );
};

export const VideoMosaicItem = React.memo(VideoMosaicItemComponent);
