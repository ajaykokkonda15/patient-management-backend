/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const common_1 = __webpack_require__(1);
const config_1 = __webpack_require__(2);
const core_1 = __webpack_require__(3);
const swagger_1 = __webpack_require__(4);
const bodyParser = __importStar(__webpack_require__(5));
const helmet_1 = __importDefault(__webpack_require__(6));
const onboarding_svc_module_1 = __webpack_require__(7);
async function bootstrap() {
    const app = await core_1.NestFactory.create(onboarding_svc_module_1.OnboardingSvcModule);
    app.set("trust proxy", 1);
    app.use(bodyParser.json({
        limit: "1mb",
        verify: (req, _res, buf) => {
            req.rawBody = buf;
        },
    }));
    app.use(bodyParser.urlencoded({ limit: "1mb", extended: true }));
    app.use((0, helmet_1.default)());
    app.enableVersioning({ type: common_1.VersioningType.URI });
    const configService = app.get(config_1.ConfigService);
    const isProduction = configService.get("NODE_ENV") === "production";
    if (!isProduction) {
        const swaggerConfig = new swagger_1.DocumentBuilder()
            .setTitle("Documentation")
            .setDescription("APIs")
            .addBearerAuth({ type: "http" }, "onboarding-svc-auth")
            .setVersion("1.0")
            .build();
        swagger_1.SwaggerModule.setup("/docs", app, swagger_1.SwaggerModule.createDocument(app, swaggerConfig), {
            explorer: true,
            swaggerOptions: {
                docExpansion: "none",
                filter: true,
                showRequestDuration: true,
            },
        });
    }
    const PORT = +configService.get("PORT") || 3000;
    const DOMAIN = configService.get("DOMAIN") || `http://localhost:${PORT}`;
    app.enableCors({
        origin: configService.get("APP_DOMAIN") || true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
    });
    await app.listen(PORT);
    console.log(`Client - Onboarding service is running on ${PORT}`);
    if (!isProduction) {
        console.log(`Swagger Docs Link - ${DOMAIN}/docs`);
    }
}
bootstrap();


/***/ }),
/* 1 */
/***/ ((module) => {

module.exports = require("@nestjs/common");

/***/ }),
/* 2 */
/***/ ((module) => {

module.exports = require("@nestjs/config");

/***/ }),
/* 3 */
/***/ ((module) => {

module.exports = require("@nestjs/core");

/***/ }),
/* 4 */
/***/ ((module) => {

module.exports = require("@nestjs/swagger");

/***/ }),
/* 5 */
/***/ ((module) => {

module.exports = require("body-parser");

/***/ }),
/* 6 */
/***/ ((module) => {

module.exports = require("helmet");

/***/ }),
/* 7 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.OnboardingSvcModule = void 0;
const common_1 = __webpack_require__(1);
const config_1 = __webpack_require__(2);
const core_1 = __webpack_require__(3);
const throttler_1 = __webpack_require__(8);
const env_validate_1 = __webpack_require__(9);
const onboarding_svc_service_1 = __webpack_require__(12);
const onboarding_svc_controller_1 = __webpack_require__(13);
let OnboardingSvcModule = class OnboardingSvcModule {
};
exports.OnboardingSvcModule = OnboardingSvcModule;
exports.OnboardingSvcModule = OnboardingSvcModule = __decorate([
    (0, common_1.Module)({
        imports: [
            throttler_1.ThrottlerModule.forRoot({
                throttlers: [
                    {
                        ttl: 60_000,
                        limit: process.env.NODE_ENV === "production" ? 200 : 1000,
                    },
                ],
                errorMessage: "Too many requests.",
            }),
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                validate: env_validate_1.validateEnv,
                envFilePath: ["apps/onboarding-svc/.env"],
            }),
        ],
        controllers: [onboarding_svc_controller_1.OnboardingSvcController],
        providers: [
            onboarding_svc_service_1.OnboardingSvcService,
            {
                provide: core_1.APP_PIPE,
                useValue: new common_1.ValidationPipe({
                    transform: true,
                    whitelist: true,
                    forbidNonWhitelisted: true,
                }),
            },
            {
                provide: core_1.APP_GUARD,
                useClass: throttler_1.ThrottlerGuard,
            },
        ],
    })
], OnboardingSvcModule);


/***/ }),
/* 8 */
/***/ ((module) => {

module.exports = require("@nestjs/throttler");

/***/ }),
/* 9 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.validateEnv = validateEnv;
const class_transformer_1 = __webpack_require__(10);
const class_validator_1 = __webpack_require__(11);
class EnvDto {
    PORT;
    NODE_ENV;
    DOMAIN;
    APP_DOMAIN;
}
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], EnvDto.prototype, "PORT", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EnvDto.prototype, "NODE_ENV", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EnvDto.prototype, "DOMAIN", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EnvDto.prototype, "APP_DOMAIN", void 0);
function validateEnv(config) {
    const validatedConfig = (0, class_transformer_1.plainToInstance)(EnvDto, config, {
        enableImplicitConversion: true,
    });
    const errors = (0, class_validator_1.validateSync)(validatedConfig, {
        skipMissingProperties: false,
    });
    if (errors.length > 0) {
        throw new Error(errors.toString());
    }
    return validatedConfig;
}


/***/ }),
/* 10 */
/***/ ((module) => {

module.exports = require("class-transformer");

/***/ }),
/* 11 */
/***/ ((module) => {

module.exports = require("class-validator");

/***/ }),
/* 12 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.OnboardingSvcService = void 0;
const common_1 = __webpack_require__(1);
let OnboardingSvcService = class OnboardingSvcService {
    async getAllConfigs() {
        return {
            appName: 'Onboarding Service',
            version: '1.0.0',
        };
    }
};
exports.OnboardingSvcService = OnboardingSvcService;
exports.OnboardingSvcService = OnboardingSvcService = __decorate([
    (0, common_1.Injectable)()
], OnboardingSvcService);


/***/ }),
/* 13 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.OnboardingSvcController = void 0;
const common_1 = __webpack_require__(1);
const swagger_1 = __webpack_require__(4);
const onboarding_svc_service_1 = __webpack_require__(12);
let OnboardingSvcController = class OnboardingSvcController {
    onboardingService;
    constructor(onboardingService) {
        this.onboardingService = onboardingService;
    }
    async getAllConfigs() {
        return await this.onboardingService.getAllConfigs();
    }
};
exports.OnboardingSvcController = OnboardingSvcController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: "Onboarding Service Configs" }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", typeof (_b = typeof Promise !== "undefined" && Promise) === "function" ? _b : Object)
], OnboardingSvcController.prototype, "getAllConfigs", null);
exports.OnboardingSvcController = OnboardingSvcController = __decorate([
    (0, swagger_1.ApiTags)("Onboarding Service"),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [typeof (_a = typeof onboarding_svc_service_1.OnboardingSvcService !== "undefined" && onboarding_svc_service_1.OnboardingSvcService) === "function" ? _a : Object])
], OnboardingSvcController);


/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__(0);
/******/ 	
/******/ })()
;