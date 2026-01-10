"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateShippingAddressDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_shipping_address_dto_1 = require("./create-shipping-address.dto");
class UpdateShippingAddressDto extends (0, mapped_types_1.PartialType)(create_shipping_address_dto_1.CreateShippingAddressDto) {
}
exports.UpdateShippingAddressDto = UpdateShippingAddressDto;
//# sourceMappingURL=update-shipping-address.dto.js.map