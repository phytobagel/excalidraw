import clsx from "clsx";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  applyDarkModeFilter,
  colorToHex,
  isTransparent,
  KEYS,
  normalizeInputColor,
  removeDarkModeFilter,
  THEME,
} from "@excalidraw/common";

import type { Theme } from "@excalidraw/element/types";

import { getShortcutKey } from "../..//shortcut";
import { useAtom } from "../../editor-jotai";
import { t } from "../../i18n";
import { useEditorInterface } from "../App";
import { activeEyeDropperAtom } from "../EyeDropper";
import { eyeDropperIcon } from "../icons";

import { activeColorPickerSectionAtom } from "./colorPickerUtils";

import type { ColorPickerType } from "./colorPickerUtils";

/** Native <input type="color"> only accepts opaque #rrggbb. */
const toColorWheelValue = (color: string, theme: Theme): string => {
  if (!color || isTransparent(color)) {
    // match canvas ink defaults: black stores as black, shows light in dark mode
    return theme === THEME.DARK
      ? applyDarkModeFilter("#000000").slice(0, 7).toLowerCase()
      : "#000000";
  }
  const hex = colorToHex(color);
  if (!hex) {
    return "#000000";
  }
  const opaque = hex.slice(0, 7);
  // native picker shows the on-canvas color (dark-mode filtered), same as swatches
  const display =
    theme === THEME.DARK ? applyDarkModeFilter(opaque) : opaque;
  return display.slice(0, 7).toLowerCase();
};

/** Convert a native picker color into the storage color Excalidraw expects. */
const fromColorWheelValue = (color: string, theme: Theme): string => {
  const normalized = normalizeInputColor(color) || color;
  return theme === THEME.DARK
    ? removeDarkModeFilter(normalized)
    : normalized;
};

export const ColorInput = ({
  color,
  onChange,
  label,
  colorPickerType,
  placeholder,
  theme,
}: {
  color: string;
  onChange: (color: string) => void;
  label: string;
  colorPickerType: ColorPickerType;
  placeholder?: string;
  theme: Theme;
}) => {
  const editorInterface = useEditorInterface();
  const [innerValue, setInnerValue] = useState(color);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeSection, setActiveColorPickerSection] = useAtom(
    activeColorPickerSectionAtom,
  );

  useEffect(() => {
    setInnerValue(color);
  }, [color]);

  const changeColor = useCallback(
    (inputValue: string) => {
      const value = inputValue.toLowerCase().trim();
      const color = normalizeInputColor(value);

      if (color) {
        onChange(color);
        setErrorMessage(null);
      } else if (value.length === 0) {
        setErrorMessage(null);
      } else if (/^#?[0-9a-f]+$/.test(value)) {
        setErrorMessage(t("colorPicker.invalidHexLength"));
      } else {
        setErrorMessage(t("colorPicker.invalidColor"));
      }
      setInnerValue(value);
    },
    [onChange],
  );

  const changeColorFromWheel = useCallback(
    (inputValue: string) => {
      const storageColor = fromColorWheelValue(inputValue, theme);
      changeColor(storageColor);
    },
    [changeColor, theme],
  );

  const inputRef = useRef<HTMLInputElement>(null);
  const eyeDropperTriggerRef = useRef<HTMLDivElement>(null);
  const showEyeDropper = editorInterface.formFactor !== "phone";

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [activeSection]);

  const [eyeDropperState, setEyeDropperState] = useAtom(activeEyeDropperAtom);

  useEffect(() => {
    return () => {
      setEyeDropperState(null);
    };
  }, [setEyeDropperState]);

  return (
    <div className="color-picker__input-label-container">
      <div
        className={clsx("color-picker__input-label", {
          "has-error": errorMessage,
        })}
      >
        <div className="color-picker__input-hash">#</div>
        <input
          ref={activeSection === "hex" ? inputRef : undefined}
          style={{ border: 0, padding: 0 }}
          spellCheck={false}
          className="color-picker-input"
          aria-label={label}
          aria-invalid={!!errorMessage}
          onChange={(event) => {
            changeColor(event.target.value);
          }}
          value={(innerValue || "").replace(/^#/, "")}
          onBlur={() => {
            setInnerValue(color);
            setErrorMessage(null);
          }}
          tabIndex={-1}
          onFocus={() => setActiveColorPickerSection("hex")}
          onKeyDown={(event) => {
            if (event.key === KEYS.TAB) {
              return;
            } else if (event.key === KEYS.ESCAPE) {
              eyeDropperTriggerRef.current?.focus();
            }
            event.stopPropagation();
          }}
          placeholder={placeholder}
        />
        <div
          style={{
            width: "1px",
            height: "1.25rem",
            backgroundColor: "var(--default-border-color)",
          }}
        />
        <div className="color-picker__input-actions">
          <label
            className="color-picker__color-wheel"
            title={t("labels.colorWheel")}
          >
            <input
              type="color"
              className="color-picker__color-wheel-input"
              value={toColorWheelValue(color || innerValue, theme)}
              aria-label={t("labels.colorWheel")}
              onInput={(event) => {
                changeColorFromWheel(event.currentTarget.value);
              }}
              onChange={(event) => {
                changeColorFromWheel(event.currentTarget.value);
              }}
              onClick={(event) => {
                // keep the stroke/background color popover open
                event.stopPropagation();
              }}
            />
          </label>
          {/* TODO reenable eyedropper on mobile with a better UX */}
          {showEyeDropper && (
            <div
              ref={eyeDropperTriggerRef}
              className={clsx("excalidraw-eye-dropper-trigger", {
                selected: eyeDropperState,
              })}
              onClick={() =>
                setEyeDropperState((s) =>
                  s
                    ? null
                    : {
                        keepOpenOnAlt: false,
                        onSelect: (color) => onChange(color),
                        colorPickerType,
                      },
                )
              }
              title={`${t(
                "labels.eyeDropper",
              )} — ${KEYS.I.toLocaleUpperCase()} or ${getShortcutKey("Alt")} `}
            >
              {eyeDropperIcon}
            </div>
          )}
        </div>
      </div>
      {errorMessage && (
        <div className="color-picker__error-message" role="alert">
          {errorMessage}
        </div>
      )}
    </div>
  );
};
