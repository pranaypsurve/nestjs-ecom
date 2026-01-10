"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateGiftVoucherDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_gift_voucher_dto_1 = require("./create-gift-voucher.dto");
class UpdateGiftVoucherDto extends (0, mapped_types_1.PartialType)(create_gift_voucher_dto_1.CreateGiftVoucherDto) {
}
exports.UpdateGiftVoucherDto = UpdateGiftVoucherDto;
//# sourceMappingURL=update-gift-voucher.dto.js.map