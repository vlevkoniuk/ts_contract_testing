import { expect } from 'chai';
import * as path from 'path';
import { PactV3, MatchersV3, LogLevel, Verifier, PactV4, SpecificationVersion } from '@pact-foundation/pact';
import { UserService } from '../index';
import { PetDto } from '../models/pet.dto';
const { like } = MatchersV3;
const LOG_LEVEL = process.env.LOG_LEVEL || 'TRACE';

describe('PactV4 tests: Consumer', () => {
    let userService: UserService;

    // Setup the 'pact' between two applications
    const dir = path.resolve(process.cwd(), './pacts/v4/');
    const provider = new PactV4({
        //dir: dir,
        consumer: 'Pets Web v4',
        provider: 'Pets API v4',
        spec: SpecificationVersion.SPECIFICATION_VERSION_V4
    });

    const petExample: PetDto = {
        id: 1002,
        category: {
            id: 1002,
            name: 'dog'
        },
        name: 'freddie-clone',
        photoUrls: ['string'],
        tags: [
            {
                id: 1002,
                name: 'my freddie clone'
            }
        ],
        status: 'available'
    };

    const EXPECTED_BODY = like(petExample);

    describe('create /pet', () => {
        it('creates the requested pet', () => {
            // Arrange
            return provider
                .addInteraction()
                .given('pet interaction')
                .uponReceiving('create a pet')
                .withRequest('POST', '/v2/pet', (builder) => {
                    builder.headers({ Accept: 'application/json', 'Content-Type': 'application/json' });
                    builder.jsonBody(petExample);
                })
                .willRespondWith(200, (builder) => {
                    builder.headers({ 'Content-Type': 'application/json' });
                    builder.jsonBody(EXPECTED_BODY);
                })
                .executeTest(async (mockserver) => {
                    // Act
                    userService = new UserService(mockserver.url);

                    const responsePost = await userService.createPet(petExample);

                    // Assert
                    expect(responsePost.data).to.deep.eq(petExample);
                });
        });

        it('returns the requested pet', () => {
            // Arrange
            return provider
                .addInteraction()
                .uponReceiving('get a pet')
                .withRequest('GET', '/v2/pet/1002', (builder) => {
                    builder.headers({ Accept: 'application/json' });
                })
                .willRespondWith(200, (builder) => {
                    builder.headers({ 'Content-Type': 'application/json' })
                    builder.jsonBody(EXPECTED_BODY);
                })
                .executeTest(async (mockserver) => {
                    // Act
                    userService = new UserService(mockserver.url);

                    const response = await userService.getPet(1002);

                    // Assert
                    expect(response.data).to.deep.eq(petExample);
                });
        });
    });
});

// (2) Verify that the provider meets all consumer expectations
describe('Pact Verification v4: Provider', () => {
    const dir = path.resolve(process.cwd(), './pacts/v4/');

    it('validates the expectations of Matching Service', () => {
        return new Verifier({
            providerBaseUrl: 'https://petstore.swagger.io', // <- location of your running provider
            pactUrls: [path.resolve(process.cwd(), './pacts/Pets Web v4-Pets API v4.json')]
        })
            .verifyProvider()
            .then(() => {
                console.log('Pact Verification Complete!');
            });
    });
});
