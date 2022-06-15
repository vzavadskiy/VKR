import * as React from 'react';
import { Box, FlexBox } from '@netris/components/base/box/box';
import { styled } from '../../../../containers/styled-components';
import { FlexWindow } from '@netris/components/flex-windows/flex-window';
import {
    VIDEO_MOSAIC_ITEM_PRESET__SAVE_BTN_CLICK,
    VIDEO_MOSAIC_ITEM_PRESET__SAVE_OUTSIDE_CLICK,
    VIDEO_MOSAIC_ITEM_PRESET_CREATE_WINDOW_ID,
    VIDEO_MOSAIC_PRESET_CREATE_FORM_ID,
} from '../../services/video-mosaic-item/video-mosaic-item-constants';
import { FlexWindowHeader } from '@netris/components/flex-windows/flex-window-header';
import { t } from '../../../../locale';
import { FlexWindowContentWrapper } from '@netris/components/flex-windows/flex-window-content-wrapper';
import { TextInput } from '@netris/components/inputs/text-input/text-input';
import {
    useApplicationAction,
    useSelector,
    useShallowEqualSelector,
} from '../../../../containers/redux-application';
import { Button } from '@netris/components/base/button/button';
import { FLEX_WINDOWS_HIDE_WINDOW } from '../../../../services/flex-windows/flex-windows-constants';
import { useFormFieldValue, useValidate } from '../../../../services/forms/forms-hooks';
import type { IVideoMosaicPresetLayoutConfig } from '../../services/video-mosaic-helpers';
import { useMemo } from 'react';
import { VideoMosaicPresetIcon } from '../video-mosaic-preset-icon';
import { Label } from '@netris/components/inputs/containers/input-components';
import { delimitedListMixin } from '@netris/components/containers/items-expandable-list/items-expandable-list';
import { FORMS__RESET_FORM } from 'services/forms/forms-constants';
import { selectFormState } from '../../../../services/forms/forms-selectors';
import { defaultOptions } from '../../../../presets/config/presets-options-default';
import { videoMosaicPresetLayoutsConfigSortingSelector } from '../../services/video-mosaic-list/video-mosaic-list-selector';
import {
    LayoutsConfigListOuter,
    VideoMosaicItemPresetCreateFormOuter,
} from './video-mosaic-item-preset-create-window-styled';
import { useFlexWindowContentMaxHeight } from './video-mosaic-item-preset-create-window-hooks';

const LayoutConfigItemOuter = styled(FlexBox)<{ selected: boolean }>`
    align-items: center;
    justify-content: space-between;
    width: 100%;
    ${delimitedListMixin};
    &:last-child {
        border-bottom: 1px solid ${p => p.theme.delimiter.color};
    }
    ${p => {
        if (p.selected) {
            return `
            &:hover {
                background-color: ${p.theme.buttons.primary.toggled.backgroundColor};
            };
            background-color: ${p.theme.buttons.primary.toggled.backgroundColor};
         `;
        } else
            return `
             cursor: pointer;
             &:hover {
                background-color: ${p.theme.background._hover.primary};
             };
        `;
    }}
`;
const LayoutConfigItem: React.FC<{
    config: IVideoMosaicPresetLayoutConfig;
}> = ({ config }) => {
    const { value, onChange } = useFormFieldValue(
        VIDEO_MOSAIC_PRESET_CREATE_FORM_ID,
        'layoutId',
        'text'
    );

    const onClick = () => {
        onChange?.(config.id, 'layoutId', undefined);
    };

    return (
        <LayoutConfigItemOuter selected={config.id === value} onClick={onClick} p={2}>
            <Box pr={2}>{config.name}</Box>
            <VideoMosaicPresetIcon size={20} config={config} />
        </LayoutConfigItemOuter>
    );
};

export const VideoMosaicItemPresetCreateForm = () => {
    const layoutsConfig = useSelector(videoMosaicPresetLayoutsConfigSortingSelector);
    const maxArchiveCamerasCount = defaultOptions.maxAllowedArchives;
    const layoutConfigArchive = layoutsConfig.filter(
        config => config.cells.length <= maxArchiveCamerasCount
    );

    const createFormState = useShallowEqualSelector(
        selectFormState(VIDEO_MOSAIC_PRESET_CREATE_FORM_ID)
    );
    const nameProps = useFormFieldValue(VIDEO_MOSAIC_PRESET_CREATE_FORM_ID, 'name', 'text');
    const { checked: isArchiveMode } = useFormFieldValue(
        VIDEO_MOSAIC_PRESET_CREATE_FORM_ID,
        'archiveMode',
        'checkbox'
    );
    const validate = useValidate(VIDEO_MOSAIC_PRESET_CREATE_FORM_ID);

    const onClose = useApplicationAction({
        type: FLEX_WINDOWS_HIDE_WINDOW,
        windowId: VIDEO_MOSAIC_ITEM_PRESET_CREATE_WINDOW_ID,
    });
    const onAdd = validate({
        type: VIDEO_MOSAIC_ITEM_PRESET__SAVE_BTN_CLICK,
        id: undefined,
    });
    const onAddOutside = validate({
        type: VIDEO_MOSAIC_ITEM_PRESET__SAVE_OUTSIDE_CLICK,
    });

    const layoutsConfigListRenderer = useMemo(() => {
        return (isArchiveMode
            ? layoutConfigArchive
            : layoutsConfig
        ).map((config: IVideoMosaicPresetLayoutConfig, index: number) => (
            <LayoutConfigItem key={index} config={config} />
        ));
    }, [isArchiveMode, layoutConfigArchive, layoutsConfig]);

    const { ref, contentHeight } = useFlexWindowContentMaxHeight();

    return (
        <VideoMosaicItemPresetCreateFormOuter height={contentHeight} ref={ref} pl={2} pr={2}>
            <TextInput
                label={t('video-mosaic.item.name')}
                placeholder={t('video-mosaic.item.name')}
                {...nameProps}
            />

            <Label>{t('video-mosaic.item.grid-type')}</Label>
            <LayoutsConfigListOuter>{layoutsConfigListRenderer}</LayoutsConfigListOuter>

            <Box textAlign={'right'} mb={2} mt={2}>
                <Button
                    ml={2}
                    onClick={onClose}
                    mr={2}
                    trainingIdentifier="video-mosaic-item-preset-create-window__on-close"
                >
                    {t('js.button.cancel')}
                </Button>
                <Button
                    buttonType="primary"
                    onClick={createFormState.cameraIds ? onAddOutside : onAdd}
                    trainingIdentifier="video-mosaic-item-preset-create-window__on-add"
                >
                    {t('js.button.create')}
                </Button>
            </Box>
        </VideoMosaicItemPresetCreateFormOuter>
    );
};

export const VideoMosaicItemPresetCreateWindow = () => {
    const onClose = useApplicationAction({
        type: FORMS__RESET_FORM,
        formId: VIDEO_MOSAIC_PRESET_CREATE_FORM_ID,
    });
    return (
        <FlexWindow
            id={VIDEO_MOSAIC_ITEM_PRESET_CREATE_WINDOW_ID}
            modal={true}
            size="small"
            onHideEnd={onClose}
        >
            <FlexWindowHeader>{t('video-mosaic.item.preset.create.form.title')}</FlexWindowHeader>
            <FlexWindowContentWrapper>
                <VideoMosaicItemPresetCreateForm />
            </FlexWindowContentWrapper>
        </FlexWindow>
    );
};
