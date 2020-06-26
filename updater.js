/* eslint-disable no-await-in-loop */
const _ = require('lodash')
const bluebird = require('bluebird')
const queueHelper = require('services/queue.helper')
const db = require('db/models')

class Updater {
  constructor({ id, userId }) {
    this.id = id
    this.userId = userId
    this.device = null
    this.dbUser = null
    this.dbProfile = null
    this.profile = null
  }

  async call() {
    if (!this.id) {
      console.error('ProfilesUpdater', 'no id or username')
      return
    }
    console.log('ProfilesUpdater', this.id, 'start')
    await this._getDBUser()
    await this._getDBProfile()

    if (this.dbProfile) {
      const userHasProfile = await this._userHasProfile()
      if (!userHasProfile) await this._addProfileToUser()
    } else {
      await this._getProfile()
      if (!this.profile) return

      await this._saveProfile()
      await this._startFollowersFetcher()
      await this._updateStatus()
    }
    console.log('ProfilesUpdater', this.id, 'end')
  }

  async _getDBUser() {
    this.dbUser = await db.User.findOne({
      where: { id: this.userId },
    })
  }

  async _userHasProfile() {
    return this.dbUser.hasProfile(this.dbProfile)
  }

  async _addProfileToUser() {
    return this.dbUser.addProfile(this.dbProfile)
  }

  async _getDBProfile() {
    this.dbProfile = await db.Profile.findOne({
      where: { id: this.id },
    })
  }

  async _nextDevice() {
    this.device = Updater.deviceRouter.next()
    await this.device.init()
  }

  async _getProfile() {
    await this._nextDevice()
    await bluebird.delay(5000 + (5000 * Math.random()))
    this.profile = {
      info: await this.device.fetchInfo(this.id),
    }
  }

  async _saveProfile() {
    const { info } = this.profile
    this.dbProfile = await this.dbUser.createProfile({
      id: info.pk,
      username: info.username,
      full_name: info.full_name,
      is_private: info.is_private,
      profile_pic_url: info.profile_pic_url,
      media_count: info.media_count,
      follower_count: info.follower_count,
      following_count: info.following_count,
      biography: info.biography,
      external_url: info.external_url,
      usertags_count: info.usertags_count,
      is_business: info.is_business,
      address_street: info.address_street,
      business_contact_method: info.business_contact_method,
      category: info.category,
      city_name: info.city_name,
      contact_phone_number: info.contact_phone_number,
      latitude: info.latitude,
      longitude: info.longitude,
      public_email: info.public_email,
      public_phone_country_code: info.public_phone_country_code,
      public_phone_number: info.public_phone_number,
      zip: info.zip,
    })
  }

  async _startFollowersFetcher() {
    await queueHelper.createJob('profilesFollowersFetcher', { id: this.id })
  }

  async _updateStatus() {
    await this.dbProfile.update({ status: 1 })
  }
}

module.exports = Updater
