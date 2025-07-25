import "#components/ak-secret-text-input";
import "#elements/forms/FormGroup";
import "#elements/forms/HorizontalFormElement";
import "#elements/utils/TimeDeltaHelp";

import { DEFAULT_CONFIG } from "#common/api/config";

import { BaseStageForm } from "#admin/stages/BaseStageForm";

import { EmailStage, StagesApi, TypeCreate } from "@goauthentik/api";

import { msg } from "@lit/localize";
import { html, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";

@customElement("ak-stage-email-form")
export class EmailStageForm extends BaseStageForm<EmailStage> {
    async loadInstance(pk: string): Promise<EmailStage> {
        const stage = await new StagesApi(DEFAULT_CONFIG).stagesEmailRetrieve({
            stageUuid: pk,
        });
        this.showConnectionSettings = !stage.useGlobalSettings;
        return stage;
    }

    async load(): Promise<void> {
        this.templates = await new StagesApi(DEFAULT_CONFIG).stagesEmailTemplatesList();
    }

    templates?: TypeCreate[];

    @property({ type: Boolean })
    showConnectionSettings = false;

    async send(data: EmailStage): Promise<EmailStage> {
        if (this.instance) {
            return new StagesApi(DEFAULT_CONFIG).stagesEmailPartialUpdate({
                stageUuid: this.instance.pk || "",
                patchedEmailStageRequest: data,
            });
        }
        return new StagesApi(DEFAULT_CONFIG).stagesEmailCreate({
            emailStageRequest: data,
        });
    }

    renderConnectionSettings(): TemplateResult {
        if (!this.showConnectionSettings) {
            return html``;
        }
        return html`<ak-form-group label="${msg("Connection settings")}">
            <div class="pf-c-form">
                <ak-form-element-horizontal label=${msg("SMTP Host")} required name="host">
                    <input
                        type="text"
                        value="${ifDefined(this.instance?.host || "")}"
                        class="pf-c-form-control"
                        required
                    />
                </ak-form-element-horizontal>
                <ak-form-element-horizontal label=${msg("SMTP Port")} required name="port">
                    <input
                        type="number"
                        value="${this.instance?.port ?? 25}"
                        class="pf-c-form-control"
                        required
                    />
                </ak-form-element-horizontal>
                <ak-form-element-horizontal label=${msg("SMTP Username")} name="username">
                    <input
                        type="text"
                        value="${ifDefined(this.instance?.username || "")}"
                        class="pf-c-form-control"
                    />
                </ak-form-element-horizontal>
                <ak-secret-text-input
                    label=${msg("SMTP Password")}
                    name="password"
                    ?revealed=${this.instance === undefined}
                ></ak-secret-text-input>
                <ak-form-element-horizontal name="useTls">
                    <label class="pf-c-switch">
                        <input
                            class="pf-c-switch__input"
                            type="checkbox"
                            ?checked=${this.instance?.useTls ?? true}
                        />
                        <span class="pf-c-switch__toggle">
                            <span class="pf-c-switch__toggle-icon">
                                <i class="fas fa-check" aria-hidden="true"></i>
                            </span>
                        </span>
                        <span class="pf-c-switch__label">${msg("Use TLS")}</span>
                    </label>
                </ak-form-element-horizontal>
                <ak-form-element-horizontal name="useSsl">
                    <label class="pf-c-switch">
                        <input
                            class="pf-c-switch__input"
                            type="checkbox"
                            ?checked=${this.instance?.useSsl ?? false}
                        />
                        <span class="pf-c-switch__toggle">
                            <span class="pf-c-switch__toggle-icon">
                                <i class="fas fa-check" aria-hidden="true"></i>
                            </span>
                        </span>
                        <span class="pf-c-switch__label">${msg("Use SSL")}</span>
                    </label>
                </ak-form-element-horizontal>
                <ak-form-element-horizontal label=${msg("Timeout")} required name="timeout">
                    <input
                        type="number"
                        value="${this.instance?.timeout ?? 30}"
                        class="pf-c-form-control"
                        required
                    />
                </ak-form-element-horizontal>
                <ak-form-element-horizontal
                    label=${msg("From address")}
                    required
                    name="fromAddress"
                >
                    <input
                        type="text"
                        value="${ifDefined(this.instance?.fromAddress || "system@authentik.local")}"
                        class="pf-c-form-control"
                        required
                    />
                </ak-form-element-horizontal>
            </div>
        </ak-form-group>`;
    }

    renderForm(): TemplateResult {
        return html` <span>
                ${msg(
                    "Verify the user's email address by sending them a one-time-link. Can also be used for recovery to verify the user's authenticity.",
                )}
            </span>
            <ak-form-element-horizontal label=${msg("Name")} required name="name">
                <input
                    type="text"
                    value="${ifDefined(this.instance?.name || "")}"
                    class="pf-c-form-control"
                    required
                />
            </ak-form-element-horizontal>
            <ak-form-group open label="${msg("Stage-specific settings")}">
                <div class="pf-c-form">
                    <ak-form-element-horizontal name="activateUserOnSuccess">
                        <label class="pf-c-switch">
                            <input
                                class="pf-c-switch__input"
                                type="checkbox"
                                ?checked=${this.instance?.activateUserOnSuccess ?? true}
                            />
                            <span class="pf-c-switch__toggle">
                                <span class="pf-c-switch__toggle-icon">
                                    <i class="fas fa-check" aria-hidden="true"></i>
                                </span>
                            </span>
                            <span class="pf-c-switch__label"
                                >${msg("Activate pending user on success")}</span
                            >
                        </label>
                        <p class="pf-c-form__helper-text">
                            ${msg(
                                "When a user returns from the email successfully, their account will be activated.",
                            )}
                        </p>
                    </ak-form-element-horizontal>
                    <ak-form-element-horizontal name="useGlobalSettings">
                        <label class="pf-c-switch">
                            <input
                                class="pf-c-switch__input"
                                type="checkbox"
                                ?checked=${this.instance?.useGlobalSettings ?? true}
                                @change=${(ev: Event) => {
                                    const target = ev.target as HTMLInputElement;
                                    this.showConnectionSettings = !target.checked;
                                }}
                            />
                            <span class="pf-c-switch__toggle">
                                <span class="pf-c-switch__toggle-icon">
                                    <i class="fas fa-check" aria-hidden="true"></i>
                                </span>
                            </span>
                            <span class="pf-c-switch__label">${msg("Use global settings")}</span>
                        </label>
                        <p class="pf-c-form__helper-text">
                            ${msg(
                                "When enabled, global Email connection settings will be used and connection settings below will be ignored.",
                            )}
                        </p>
                    </ak-form-element-horizontal>
                    <ak-form-element-horizontal
                        label=${msg("Token expiration")}
                        required
                        name="tokenExpiry"
                    >
                        <input
                            type="text"
                            value="${this.instance?.tokenExpiry ?? "minutes=30"}"
                            class="pf-c-form-control"
                            required
                        />
                        <p class="pf-c-form__helper-text">
                            ${msg("Time the token sent is valid.")}
                        </p>
                        <ak-utils-time-delta-help></ak-utils-time-delta-help>
                    </ak-form-element-horizontal>
                    <ak-form-element-horizontal label=${msg("Subject")} required name="subject">
                        <input
                            type="text"
                            value="${this.instance?.subject ?? "authentik"}"
                            class="pf-c-form-control"
                            required
                        />
                    </ak-form-element-horizontal>
                    <ak-form-element-horizontal label=${msg("Template")} required name="template">
                        <select name="users" class="pf-c-form-control">
                            ${this.templates?.map((template) => {
                                const selected = this.instance?.template === template.name;
                                return html`<option
                                    value=${ifDefined(template.name)}
                                    ?selected=${selected}
                                >
                                    ${template.description}
                                </option>`;
                            })}
                        </select>
                    </ak-form-element-horizontal>
                </div>
            </ak-form-group>
            ${this.renderConnectionSettings()}`;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "ak-stage-email-form": EmailStageForm;
    }
}
