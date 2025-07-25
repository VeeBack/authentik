import "#components/ak-text-input";

import { DEFAULT_CONFIG } from "#common/api/config";
import { globalAK } from "#common/global";

import { Form } from "#elements/forms/Form";

import { CoreApi, ImpersonationRequest } from "@goauthentik/api";

import { msg } from "@lit/localize";
import { html, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("ak-user-impersonate-form")
export class UserImpersonateForm extends Form<ImpersonationRequest> {
    @property({ type: Number })
    instancePk?: number;

    async send(data: ImpersonationRequest): Promise<void> {
        return new CoreApi(DEFAULT_CONFIG)
            .coreUsersImpersonateCreate({
                id: this.instancePk || 0,
                impersonationRequest: data,
            })
            .then(() => {
                window.location.href = globalAK().api.base;
            });
    }

    renderForm(): TemplateResult {
        return html`<ak-text-input
            name="reason"
            label=${msg("Reason")}
            help=${msg("Reason for impersonating the user")}
        ></ak-text-input>`;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "ak-user-impersonate-form": UserImpersonateForm;
    }
}
