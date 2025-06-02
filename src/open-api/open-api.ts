/**
 * inspired by https://github.com/metadevpro/openapi3-ts
 * @see https://github.com/OAI/OpenAPI-Specification/blob/3.0.0-rc0/versions/3.0.md
 */

export interface OpenApiDoc {
    openapi: string;
    info: InfoDoc;
    servers?: ServerDoc[];
    paths: PathsDoc;
    components?: ComponentsDoc;
    security?: SecurityRequirementDoc[];
    tags?: TagDoc[];
    externalDocs?: ExternalDocumentationDoc;
}

export interface InfoDoc {
    title: string;
    description?: string;
    termsOfService?: string;
    contact?: ContactDoc;
    license?: LicenseDoc;
    version: string;
}

export interface ContactDoc {
    name?: string;
    url?: string;
    email?: string;
}


// region server
/**
 * License information for the exposed API.
 * @extendible
 *
 * name: Apache 2.0
 * identifier: Apache-2.0
 * */
export interface LicenseDoc {
    /**
     * The license name used for the API
     * */
    name: string;
    /**
     * An SPDX license expression for the API. The identifier field is mutually exclusive of the url field.
     * See possible values at {@link https://spdx.org/licenses/}
     * */
    identifier?: string;
    /**
     * A URI for the license used for the API. This MUST be in the form of a URI. The url field is mutually exclusive of the identifier field.
     * */
    url?: string;

}

/**
 * An object representing a Server.
 * @extendible
 * */
export interface ServerDoc {
    /**
     * A URL to the target host. This URL supports Server Variables and MAY be relative,
     * to indicate that the host location is relative to the location
     * where the document containing the Server Object is being served.
     * Variable substitutions will be made when a variable is named in {braces}.
     * */
    url: string;

    /**
     * An optional string describing the host designated by the URL. CommonMark syntax MAY be used for rich text representation.
     * */
    description?: string;

    /**
     * A map between a variable name and its value.
     * The value is used for substitution in the server's URL template.
     * */
    variables?: Record<string, ServerVariableDoc>;
}

/**
 * An object representing a Server Variable for server URL template substitution.
 * */
export interface ServerVariableDoc {
    /**
     * An enumeration of string values to be used if the substitution options are from a limited set. The array MUST NOT be empty.
     * */
    enum?: string[] | boolean[] | number[];
    /**
     * The default value to use for substitution, which SHALL be sent if an alternate value is not supplied.
     * If the enum is defined, the value MUST exist in the enum's values.
     * Note that this behavior is different from the Schema Object's default keyword, which documents the receiver's behavior rather than inserting the value into the data.
     * */
    default: string | boolean | number;
    /**
     * An optional description for the server variable. CommonMark syntax MAY be used for rich text representation.
     * */
    description?: string;
}

/**
 * Adds metadata to a single tag that is used by the Operation Object.
 * It is not mandatory to have a Tag Object per tag defined in the Operation Object instances.
 * */
export interface TagDoc {
    /**
     * The name of the tag.
     * */
    name: string;
    /**
     * A description for the tag. CommonMark syntax MAY be used for rich text representation.
     * */
    description?: string;

    /**
     * Additional external documentation for this tag.
     * */
    externalDocs?: ExternalDocumentationDoc;
}

/**
 * Describes a single API operation on a path.
 * */
export interface OperationDoc {
    /**
     * A list of tags for API documentation control. Tags can be used for logical grouping of operations by resources or any other qualifier.
     * */
    tags?: string[];
    /**
     * A short summary of what the operation does.
     */
    summary?: string;
    /**
     * A verbose explanation of the operation behavior. CommonMark syntax MAY be used for rich text representation.
     * */
    description?: string;
    /**
     * Additional external documentation for this operation.
     * */
    externalDocs?: ExternalDocumentationDoc;
    /**
     * Unique string used to identify the operation.
     * The id MUST be unique among all operations described in the API.
     * The operationId value is case-sensitive.
     * Tools and libraries MAY use the operationId to uniquely identify an operation, therefore, it is RECOMMENDED to follow common programming naming conventions.
     * */
    operationId?: string;
    /**
     * A list of parameters that are applicable for this operation.
     * If a parameter is already defined at the Path Item, the new definition will override it but can never remove it.
     * The list MUST NOT include duplicated parameters.
     * A unique parameter is defined by a combination of a name and location.
     * The list can use the Reference Object to link to parameters that are defined in the OpenAPI Object's components.parameters.
     * */
    parameters?: (ParameterDoc | ReferenceDoc)[];
    /**
     * The request body applicable for this operation.
     * The requestBody is fully supported in HTTP methods where the HTTP 1.1 specification RFC7231 has explicitly defined semantics for request bodies.
     * In other cases where the HTTP spec is vague (such as GET, HEAD and DELETE), requestBody is permitted but does not have well-defined semantics and SHOULD be avoided if possible.
     * */
    requestBody?: RequestBodyDoc | ReferenceDoc;
    /**
     * The list of possible responses as they are returned from executing this operation.
     * */
    responses: ResponsesDoc;
    /**
     * A map of possible out-of band callbacks related to the parent operation.
     * The key is a unique identifier for the Callback Object.
     * Each value in the map is a Callback Object that describes a request that may be initiated by the API provider and the expected responses.
     * */
    callbacks?: CallbacksDoc;
    /**
     * Declares this operation to be deprecated. Consumers SHOULD refrain from usage of the declared operation.
     * Default value is false.
     * */
    deprecated?: boolean;
    /**
     * A declaration of which security mechanisms can be used for this operation.
     * The list of values includes alternative Security Requirement Objects that can be used.
     * Only one of the Security Requirement Objects need to be satisfied to authorize a request.
     * To make security optional, an empty security requirement ({}) can be included in the array.
     * This definition overrides any declared top-level security.
     * To remove a top-level security declaration, an empty array can be used.
     * */
    security?: SecurityRequirementDoc[];
    /**
     * An alternative servers array to service this operation.
     * If a servers array is specified at the Path Item Object or OpenAPI Object level, it will be overridden by this value.
     * */
    servers?: ServerDoc[];
}

// endregion server

export interface ComponentsDoc {
    schemas?: Record<string, SchemaDoc | ReferenceDoc>;
    responses?: Record<string, ResponseDoc | ReferenceDoc>;
    parameters?: Record<string, ParameterDoc | ReferenceDoc>;
    examples?: Record<string, ExampleDoc | ReferenceDoc>;
    requestBodies?: Record<string, RequestBodyDoc | ReferenceDoc>;
    headers?: Record<string, HeaderDoc | ReferenceDoc>;
    securitySchemes?: Record<string, SecuritySchemeDoc | ReferenceDoc>;
    links?: Record<string, LinkDoc | ReferenceDoc>;
    callbacks?: Record<string, CallbackDoc | ReferenceDoc>;
}

export interface PathItemDoc {
    $ref?: string;
    summary?: string;
    description?: string;
    get?: OperationDoc;
    put?: OperationDoc;
    post?: OperationDoc;
    delete?: OperationDoc;
    options?: OperationDoc;
    head?: OperationDoc;
    patch?: OperationDoc;
    trace?: OperationDoc;
    servers?: ServerDoc[];
    parameters?: (ParameterDoc | ReferenceDoc)[];
}


export interface ExternalDocumentationDoc {
    description?: string;
    url: string;
}

export interface BaseParameterDoc {
    description?: string;
    required?: boolean;
    deprecated?: boolean;
    allowEmptyValue?: boolean;
    style?: ParameterStyle;
    explode?: boolean;
    allowReserved?: boolean;
    schema?: SchemaDoc | ReferenceDoc;
    examples?: Record<string, ExampleDoc | ReferenceDoc>;
    example?: any;
    content?: ContentDoc;
}

export interface ParameterDoc extends BaseParameterDoc {
    name: string;
    in: ParameterLocation;
}

export interface RequestBodyDoc {
    description?: string;
    content: ContentDoc;
    required?: boolean;
}

export interface MediaTypeDoc {
    schema?: SchemaDoc | ReferenceDoc;
    examples?: ExamplesDoc;
    example?: any;
    encoding?: EncodingDoc;
}

export interface EncodingPropertyDoc {
    contentType?: string;
    headers?: Record<string, HeaderDoc | ReferenceDoc>;
    style?: string;
    explode?: boolean;
    allowReserved?: boolean;
}

export interface ResponsesDoc
    extends Record<string, ResponseDoc | ReferenceDoc | undefined> {
    default?: ResponseDoc | ReferenceDoc;
}

export interface ResponseDoc {
    description: string;
    headers?: HeadersDoc;
    content?: ContentDoc;
    links?: LinksDoc;
}


export interface ExampleDoc {
    summary?: string;
    description?: string;
    value?: any;
    externalValue?: string;
}

export interface LinkDoc {
    operationRef?: string;
    operationId?: string;
    parameters?: LinkParametersDoc;
    requestBody?: any | string;
    description?: string;
    server?: ServerDoc;
}


export interface ReferenceDoc {
    $ref: string;
}

export interface SchemaDoc {
    nullable?: boolean;
    discriminator?: DiscriminatorDoc;

    /**
     * Read-only properties are included in responses but not in requests
     * */
    readOnly?: boolean;
    /**
     * Write-only properties may be sent in requests but not in responses
     * */
    writeOnly?: boolean;
    xml?: XmlDoc;
    externalDocs?: ExternalDocumentationDoc;
    example?: any;
    examples?: any[] | Record<string, any>;
    deprecated?: boolean;
    type?: string;
    allOf?: (SchemaDoc | ReferenceDoc)[];
    oneOf?: (SchemaDoc | ReferenceDoc)[];
    anyOf?: (SchemaDoc | ReferenceDoc)[];
    not?: SchemaDoc | ReferenceDoc;

    additionalProperties?: SchemaDoc | ReferenceDoc | boolean;
    patternProperties?: SchemaDoc | ReferenceDoc | any;
    description?: string;
    format?: string;
    default?: any;
    title?: string;

    // region string
    maxLength?: number;
    minLength?: number;
    pattern?: string;
    // endregion string

    // region number
    multipleOf?: number;
    maximum?: number;
    exclusiveMaximum?: boolean;
    minimum?: number;
    exclusiveMinimum?: boolean;
    // endregion number

    // region array
    /**
     * The value of items is a schema that describes the type and format of array items.
     *
     * Notes:
     * - type should be "array"
     * - Can be nested
     * */
    items?: SchemaDoc | ReferenceDoc;
    /**
     * Maximum length of an array
     *
     * Notes:
     * - type should be "array"
     * */
    maxItems?: number;
    /**
     * Minimum length of an array
     *
     * Notes:
     * - type should be "array"
     * */
    minItems?: number;

    /**
     * To specify that all items in the array must be unique
     *
     * Notes:
     * - type should be "array"
     * */
    uniqueItems?: boolean;
    // endregion array

    // region object
    /**
     * It's used to define the object properties
     * */
    properties?: Record<string, SchemaDoc | ReferenceDoc>;

    /**
     * Maximum size of an object items
     *
     * Notes:
     * - type should be "object"
     * */
    maxProperties?: number;

    /**
     * Minimum size of an object items
     *
     * Notes:
     * - type should be "object"
     * */
    minProperties?: number;

    /**
     * By default, all object properties are optional.
     * You can specify the required properties in the required list
     * */
    required?: string[];
    // endregion object

    enum?: any[];

    'x-enumNames'?: string[];
}

export interface DiscriminatorDoc {
    propertyName: string;
    mapping?: Record<string, string>;
}

export interface XmlDoc {
    name?: string;
    namespace?: string;
    prefix?: string;
    attribute?: boolean;
    wrapped?: boolean;
}

export interface SecuritySchemeDoc {
    type: SecuritySchemeType;
    description?: string;
    name?: string;
    in?: string;
    scheme?: string;
    bearerFormat?: string;
    flows?: OAuthFlowsDoc;
    openIdConnectUrl?: string;
    'x-tokenName'?: string;
}

export interface OAuthFlowsDoc {
    implicit?: OAuthFlowDoc;
    password?: OAuthFlowDoc;
    clientCredentials?: OAuthFlowDoc;
    authorizationCode?: OAuthFlowDoc;
}

export interface OAuthFlowDoc {
    authorizationUrl?: string;
    tokenUrl?: string;
    refreshUrl?: string;
    scopes: ScopesDoc;
}

export type ContentDoc = Record<string, MediaTypeDoc>;
export type EncodingDoc = Record<string, EncodingPropertyDoc>;
export type CallbacksDoc = Record<string, CallbackDoc | ReferenceDoc>;
export type CallbackDoc = Record<string, PathItemDoc>;
export type HeadersDoc = Record<string, HeaderDoc | ReferenceDoc>;
export type LinksDoc = Record<string, LinkDoc | ReferenceDoc>;
export type LinkParametersDoc = Record<string, any>;
export type HeaderDoc = BaseParameterDoc;
export type ExamplesDoc = Record<string, ExampleDoc | ReferenceDoc>;
export type SchemasDoc = Record<string, SchemaDoc>;
export type ScopesDoc = Record<string, any>;
export type SecurityRequirementDoc = Record<string, string[]>;
export type PathsDoc = Record<string, PathItemDoc>;
export type SecuritySchemeType = 'apiKey' | 'http' | 'oauth2' | 'openIdConnect';
export type ParameterLocation = 'query' | 'header' | 'path' | 'cookie';
export type ParameterStyle =
    | 'matrix'
    | 'label'
    | 'form'
    | 'simple'
    | 'spaceDelimited'
    | 'pipeDelimited'
    | 'deepObject';


/**
 * for map
 *
 * additionalProperties:
 *   type: string
 *
 * ------
 *
 * for discriminator
 *
 * components:
 *   responses:
 *     sampleObjectResponse:
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - $ref: '#/components/schemas/Object1'
 *               - $ref: '#/components/schemas/Object2'
 *               - $ref: 'sysObject.json#/sysObject'
 *             discriminator:
 *               propertyName: objectType
 *               mapping:
 *                 obj1: '#/components/schemas/Object1'
 *                 obj2: '#/components/schemas/Object2'
 *                 system: 'sysObject.json#/sysObject'
 *   …
 *   schemas:
 *     Object1:
 *       type: object
 *       required:
 *         - objectType
 *       properties:
 *         objectType:
 *           type: string
 *       …
 *     Object2:
 *       type: object
 *       required:
 *         - objectType
 *       properties:
 *         objectType:
 *           type: string
 *       …
 * */


/*
servers:
  - url: https://development.gigantic-server.com/v1
    description: Development server
  - url: https://staging.gigantic-server.com/v1
    description: Staging server
  - url: https://api.gigantic-server.com/v1
    description: Production server

servers:
  - url: https://{username}.gigantic-server.com:{port}/{basePath}
    description: The production API server
    variables:
      username:
        # note! no enum here means it is an open value
        default: demo
        description: A user-specific subdomain. Use `demo` for a free sandbox environment.
      port:
        enum:
          - '8443'
          - '443'
        default: '8443'
      basePath:
        # open meaning there is the opportunity to use special base paths as assigned by the provider, default is `v2`
        default: v2

 * */
