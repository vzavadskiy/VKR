import * as React from 'react';
import { Box, FlexBox } from '@netris/components/base/box/box';
import { styled } from '../../../../containers/styled-components';
import { Button } from '@netris/components/base/button/button';
import { Sliders, ChevronsLeft, ChevronsRight, Play, Pause } from '@netris/netris-icons';
import { format, t } from '../../../../locale';
import {
    useApplicationAction,
    useDispatch,
    useShallowEqualSelector,
} from '../../../../containers/redux-application';
import { useEffect, useMemo, useState } from 'react';
import {
    videoMosaicItemSelector,
    videoMosaicItemPresetSelector,
    videoMosaicPresetLayoutConfigSelector,
} from '../../services/video-mosaic-item/video-mosaic-item-selector';
import {
    VIDEO_MOSAIC_ITEM__CHANGE,
    VIDEO_MOSAIC_PRESET_FORM_ID,
} from '../../services/video-mosaic-item/video-mosaic-item-constants';
import { InputGroup } from '@netris/components/inputs/containers/input-group';
import type { IApplicationState } from '../../../../containers/application-state';
import { DropdownWrapper } from '../../../../components/react/ui/dropdown-wrapper';
import { TextInput } from '@netris/components/inputs/text-input/text-input';
import { Text } from '../../../../components/react/ui/typography';
import { SwitchInput } from '@netris/components/inputs/switch/switch-input';
import { PresetRotateTimer } from './video-mosiac-item-preset-rotation-timer';
import { convertFromNumberToString } from '@netris/components/utils/mask-utils';
import { prepareNavigation } from './video-mosaic-item-preset-helper';
import { rotationIntervalValues } from '../../services/video-mosaic-item/video-mosaic-item-reducer';
import { useFormFieldValue, useFormFieldValues } from '../../../../services/forms/forms-hooks';
import { videoMosaicCellsSelector } from '../../services/video-mosaic-cells/video-mosaic-cells-selector';
import { FORMS__VALIDATE_FIELD } from '@netris/components/services/forms/forms-constants';
import { useSystemSetting } from '../../../../containers/application-utils-react';

const VideoMosaicItemPageOuter = styled(FlexBox)<{ hidden: boolean }>`
    opacity: ${p => (p.hidden ? 0 : 'flex')};
`;

const VideoMosaicItemPageCountOuter = styled(FlexBox)`
    white-space: nowrap;
    align-items: center;
`;

const TimerOuter = styled(FlexBox)<{ screenRotationEnabled: boolean | undefined }>`
    align-items: center;
    background-color: ${p =>
        p.screenRotationEnabled
            ? p.theme.buttons.primary.toggled.backgroundColor
            : p.theme.buttons.primary.default.backgroundColor};
`;

const RotationIntervalButton: React.FC<{
    readonly value: number;
    readonly selected: boolean;
    readonly disabled: boolean;
}> = ({ value, selected, disabled }) => {
    const { onChange: onRotationPeriodChange } = useFormFieldValue(
        VIDEO_MOSAIC_PRESET_FORM_ID,
        'rotationPeriod',
        'text'
    );
    const onClick = () => {
        onRotationPeriodChange?.(value, 'rotationPeriod', undefined);
    };
    return (
        <Button
            disabled={disabled}
            toggled={selected}
            onClick={onClick}
            trainingIdentifier="video-mosaic-item-preset-rotation-controls__interval-value-title"
        >
            {format('video-mosaic.item.rotation.interval-value.title', { value: value / 1000 })}
        </Button>
    );
};

const RotationDropdownContentHeader = styled(FlexBox)`
    justify-content: space-between;
    border-bottom: 1px solid ${p => p.theme.delimiter.color};
`;

const RotationDropdownContent = () => {
    const {
        rotationPeriod: { onChange: onRotationPeriodChange, value: rotationPeriodValue },
        arbitraryRotationPeriod: {
            onChange: onArbitraryRotationPeriodChange,
            value: arbitraryRotationPeriodValue,
        },
        screenRotationEnabled: {
            onChange: onScreenRotationEnabledChange,
            checked: screenRotationEnabledValue,
        },
    } = useFormFieldValues(VIDEO_MOSAIC_PRESET_FORM_ID, {
        rotationPeriod: 'text',
        arbitraryRotationPeriod: 'text',
        screenRotationEnabled: 'checkbox',
    });

    const validate = useApplicationAction({
        type: FORMS__VALIDATE_FIELD,
        formId: VIDEO_MOSAIC_PRESET_FORM_ID,
        field: 'arbitraryRotationPeriod',
    });

    useEffect(() => {
        if (arbitraryRotationPeriodValue) {
            validate();
        }
    }, [validate, arbitraryRotationPeriodValue]);
    const minValidationValueFroRotation = useSystemSetting(
        'VIDEO_MOSAIC_ROTATION_INTERVAL_VALIDATE_MIN_VALUE'
    );
    const maxValidationValueFroRotation = useSystemSetting(
        'VIDEO_MOSAIC_ROTATION_INTERVAL_VALIDATE_MAX_VALUE'
    );
    const [valueFromArbitraryRotationPeriod, setValueFromArbitraryRotationPeriod] = useState<
        number | undefined
    >(arbitraryRotationPeriodValue);
    const [error, setError] = useState<string[]>([]);
    const items = useMemo(() => {
        return rotationIntervalValues.map(v => (
            <RotationIntervalButton
                disabled={!!valueFromArbitraryRotationPeriod || !screenRotationEnabledValue}
                key={v}
                value={v}
                selected={rotationPeriodValue === v}
            />
        ));
    }, [valueFromArbitraryRotationPeriod, screenRotationEnabledValue, rotationPeriodValue]);
    const onChangeArbitraryInterval = (value: number) => {
        if (!value) {
            setError([]);
            setValueFromArbitraryRotationPeriod(undefined);
            onArbitraryRotationPeriodChange(null);
            onRotationPeriodChange(rotationIntervalValues[2]);
        } else if (
            value >= minValidationValueFroRotation &&
            value <= maxValidationValueFroRotation
        ) {
            setValueFromArbitraryRotationPeriod(value * 1000);
            setError([]);
            onArbitraryRotationPeriodChange?.(value * 1000, undefined, undefined);
        } else {
            setValueFromArbitraryRotationPeriod(value * 1000);
            setError([t('validation.validator.generic.invalid')]);
        }
    };
    const onSwitchScreenRotationChange = (value: boolean) => {
        onScreenRotationEnabledChange?.(value);
    };

    return (
        <>
            <RotationDropdownContentHeader p={2}>
                <Text size="regular">{t('video-mosaic.item.rotation.header.title')}</Text>
                <SwitchInput
                    onChange={onSwitchScreenRotationChange}
                    checked={screenRotationEnabledValue}
                />
            </RotationDropdownContentHeader>
            <Box p={2}>
                <InputGroup mb={2} label={t('video-mosaic.item.rotation.interval')}>
                    {items}
                </InputGroup>
                <TextInput
                    mb={1}
                    label={t('video-mosaic.item.rotation.arbitrary-interval')}
                    placeholder={format('video-mosaic.item.rotation.interval-value.title', {
                        value: rotationPeriodValue / 1000,
                    })}
                    value={
                        valueFromArbitraryRotationPeriod
                            ? valueFromArbitraryRotationPeriod / 1000
                            : undefined
                    }
                    onChange={onChangeArbitraryInterval}
                    transformValueForDisplay={convertFromNumberToString()}
                    trainingIdentifier="video-mosaic-item-preset-rotation-controls__rotation-arbitrary-interval"
                    disabled={!screenRotationEnabledValue}
                    errors={error}
                    onBlur={() => {
                        setError([]);
                    }}
                />
                <Text size="micro" color="secondary">
                    {t('video-mosaic.item.rotation.arbitrary-interval.help')}
                </Text>
            </Box>
        </>
    );
};

const VideoMosaicItemPresetRotationControlsSelector = (s: IApplicationState) => {
    return {
        config: videoMosaicPresetLayoutConfigSelector(s),
        preset: videoMosaicItemPresetSelector(s),
        offset: videoMosaicItemSelector(s).offset,
        presetCells: videoMosaicCellsSelector(s),
    };
};

export const VideoMosaicItemPresetRotationControls = () => {
    const dispatch = useDispatch();
    const { config, preset, offset, presetCells } = useShallowEqualSelector(
        VideoMosaicItemPresetRotationControlsSelector
    );
    const { limit, currentPage, pages } = prepareNavigation({
        config,
        offset,
        presetCellsCount: presetCells.cellCount,
    });

    const onNavigation = (v: 'next' | 'prev') => () => {
        dispatch({
            type: VIDEO_MOSAIC_ITEM__CHANGE,
            payload: {
                offset: v === 'next' ? offset + limit : offset - limit,
                timer: preset.arbitraryRotationPeriod || preset.rotationPeriod,
            },
        });
    };
    useEffect(() => {
        if (pages && currentPage > pages) {
            dispatch({
                type: VIDEO_MOSAIC_ITEM__CHANGE,
                payload: {
                    offset: (pages - 1) * limit,
                },
            });
        }
    }, [pages, limit, currentPage, dispatch]);

    const {
        onChange: onScreenRotationEnabledChange,
        checked: screenRotationEnabledValue,
    } = useFormFieldValue(VIDEO_MOSAIC_PRESET_FORM_ID, 'screenRotationEnabled', 'checkbox');
    const onScreenRotationEnabledToggle = () => {
        onScreenRotationEnabledChange?.(!screenRotationEnabledValue);
    };
    return (
        <VideoMosaicItemPageOuter hidden={pages <= 1}>
            <VideoMosaicItemPageCountOuter mr={2}>
                {format('video-mosaic.item.page.title', {
                    current: currentPage,
                    total: pages,
                })}
            </VideoMosaicItemPageCountOuter>
            <InputGroup withoutDelimiter={true}>
                <Button
                    buttonType="primary"
                    tooltipText={t('video-mosaic.item.page.prev')}
                    icon={ChevronsLeft}
                    disabled={currentPage === 1}
                    onClick={onNavigation('prev')}
                    trainingIdentifier="video-mosaic-item-preset-rotation-controls__page-prev"
                />
                <TimerOuter screenRotationEnabled={screenRotationEnabledValue}>
                    <Box ml={1}>
                        <PresetRotateTimer />
                    </Box>
                    {screenRotationEnabledValue ? (
                        <Button
                            buttonType="transparentBackground"
                            tooltipText={t('video-mosaic.item.rotation.pause')}
                            icon={Pause}
                            toggled={true}
                            onClick={onScreenRotationEnabledToggle}
                            trainingIdentifier="video-mosaic-item-preset-rotation-controls__rotation-pause"
                        />
                    ) : (
                        <Button
                            buttonType="transparentBackground"
                            tooltipText={t('video-mosaic.item.rotation.resume')}
                            icon={Play}
                            onClick={onScreenRotationEnabledToggle}
                            trainingIdentifier="video-mosaic-item-preset-rotation-controls__rotation-resume"
                        />
                    )}
                </TimerOuter>

                <Button
                    buttonType="primary"
                    tooltipText={t('video-mosaic.item.page.next')}
                    icon={ChevronsRight}
                    mr={2}
                    disabled={currentPage === pages || presetCells.loading}
                    onClick={onNavigation('next')}
                    trainingIdentifier="video-mosaic-item-preset-rotation-controls__item-page-next"
                />
            </InputGroup>

            <DropdownWrapper
                preferredPosition={'bl'}
                contentRenderer={() => <RotationDropdownContent />}
                trainingIdentifier="video-mosaic-item-preset-rotation-controls__dropdown-wrapper"
            >
                <Button
                    icon={Sliders}
                    tooltipText={t('video-mosaic.item.rotation.header.title')}
                    trainingIdentifier="video-mosaic-item-preset-rotation-controls__rotation-header-title"
                />
            </DropdownWrapper>
        </VideoMosaicItemPageOuter>
    );
};
