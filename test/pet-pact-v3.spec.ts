import { expect } from 'chai';
import * as path from 'path';
import { PactV3, MatchersV3, LogLevel, Verifier, PactV4 } from '@pact-foundation/pact';
import { UserService } from '../index';
import { PetDto } from '../models/pet.dto';
const { like } = MatchersV3;
const LOG_LEVEL = process.env.LOG_LEVEL || 'TRACE';

describe('PactV3 consumer tests', () => {
    let userService: UserService;

    // Setup the 'pact' between two applications
    const provider = new PactV3({
        consumer: 'Pets Web',
        provider: 'Pets API'
        //logLevel: LOG_LEVEL as LogLevel,
    });

    const petExample: PetDto = {
        id: 1001,
        category: {
            id: 1001,
            name: 'dog'
        },
        name: 'freddie',
        photoUrls: ['string'],
        tags: [
            {
                id: 1001,
                name: 'my freddie'
            }
        ],
        status: 'available'
    };

    const EXPECTED_BODY = like(petExample);

    describe('create and then request a pet', () => {
        it('returns the requested pet', () => {
            // Arrange
            provider
                .given('pet interaction')
                .uponReceiving('create a pet')
                .withRequest({
                    method: 'POST',
                    path: '/v2/pet',
                    body: petExample,
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json'
                    }
                })
                .willRespondWith({
                    status: 200,
                    headers: { 'content-type': 'application/json' },
                    body: EXPECTED_BODY
                })
                .uponReceiving('get a pet')
                .withRequest({
                    method: 'GET',
                    path: '/v2/pet/1001'
                })
                .willRespondWith({
                    status: 200,
                    headers: { 'content-type': 'application/json' },
                    body: EXPECTED_BODY
                });

            return provider.executeTest(async (mockserver) => {
                // Act
                userService = new UserService(mockserver.url);

                const responsePost = await userService.createPet(petExample);
                const response = await userService.getPet(1001);

                // Assert
                expect(response.data).to.deep.eq(petExample);
            });
        });
    });
});

// (2) Verify that the provider meets all consumer expectations
describe('PactV3 Verification', () => {
    it('validates the expectations of Matching Service', () => {
        return new Verifier({
            providerBaseUrl: 'https://petstore.swagger.io', // <- location of your running provider
            pactUrls: [path.resolve(process.cwd(), './pacts/Pets Web-Pets API.json')]
        })
            .verifyProvider()
            .then(() => {
                console.log('Pact Verification Complete!');
            });
    });
});
